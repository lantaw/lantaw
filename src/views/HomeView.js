import { assertEnv } from "../config/env.js";
import { checkSupabaseConnection } from "../lib/supabase.js";
import { checkTmdbConnection } from "../lib/tmdb.js";
import { getPopularMovies } from "../services/movieService.js";
import { MovieCard } from "../components/MovieCard.js";
import { AuthBar } from "../components/AuthBar.js";
import { linkTo } from "../router/index.js";

export async function HomeView(root) {
  root.innerHTML = `
    <header class="topbar topbar--row" id="top">
      <div>
        <h1 class="brand">Movie</h1>
        <p class="tagline">Personal library · TMDB + Supabase</p>
      </div>
    </header>

    <nav class="nav-links">
      <a href="${linkTo("/watchlist")}">My watchlist</a>
    </nav>

    <section class="status" id="status">
      <p>Checking connections…</p>
    </section>

    <section class="grid-section">
      <h2>Popular</h2>
      <div class="grid" id="grid">
        <p class="muted">Loading…</p>
      </div>
    </section>
  `;

  const auth = await AuthBar(root.querySelector("#top"));

  const statusEl = root.querySelector("#status");
  const gridEl = root.querySelector("#grid");
  const missing = assertEnv();

  if (missing.length) {
    statusEl.innerHTML = `
      <div class="status-card status-card--warn">
        <strong>Fill in your keys</strong>
        <p>Edit <code>src/config/env.js</code> — missing: ${missing.join(", ")}</p>
      </div>
    `;
    gridEl.innerHTML = `<p class="muted">Add API keys to load movies.</p>`;
    return {
      unmount() {
        auth.unmount();
      },
    };
  }

  const [supabase, tmdb] = await Promise.all([
    checkSupabaseConnection(),
    checkTmdbConnection(),
  ]);

  statusEl.innerHTML = `
    <div class="status-row">
      <div class="status-card ${supabase.ok ? "status-card--ok" : "status-card--err"}">
        <span>Supabase</span>
        <strong>${supabase.ok ? "OK" : "Fail"}</strong>
        <small>${escapeHtml(supabase.message)}</small>
      </div>
      <div class="status-card ${tmdb.ok ? "status-card--ok" : "status-card--err"}">
        <span>TMDB</span>
        <strong>${tmdb.ok ? "OK" : "Fail"}</strong>
        <small>${escapeHtml(tmdb.message)}</small>
      </div>
    </div>
  `;

  if (!tmdb.ok) {
    gridEl.innerHTML = `<p class="muted">Fix TMDB key to load popular movies.</p>`;
    return {
      unmount() {
        auth.unmount();
      },
    };
  }

  try {
    const { results } = await getPopularMovies();
    gridEl.innerHTML = "";
    if (!results.length) {
      gridEl.innerHTML = `<p class="muted">No movies returned.</p>`;
    } else {
      results.forEach((m) => gridEl.appendChild(MovieCard(m)));
    }
  } catch (err) {
    gridEl.innerHTML = `<p class="muted">${escapeHtml(err.message)}</p>`;
  }

  return {
    unmount() {
      auth.unmount();
    },
  };
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
