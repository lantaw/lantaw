import { linkTo } from "../router/index.js";
import { listWatchlist, removeFromWatchlist } from "../services/watchlistService.js";
import { AuthBar } from "../components/AuthBar.js";

export async function WatchlistView(root) {
  root.innerHTML = `
    <header class="topbar topbar--row" id="top">
      <div>
        <a class="back" href="${linkTo("/")}">← Home</a>
        <h1 class="brand">Watchlist</h1>
      </div>
    </header>
    <div class="grid" id="grid">
      <p class="muted">Loading…</p>
    </div>
  `;

  const auth = await AuthBar(root.querySelector("#top"));
  const grid = root.querySelector("#grid");

  try {
    const items = await listWatchlist();
    grid.innerHTML = "";

    if (!items.length) {
      grid.innerHTML = `<p class="muted">No saved movies yet. Open a title and add it.</p>`;
    } else {
      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "watch-card";
        card.innerHTML = `
          <a href="${linkTo(`/movie/${item.tmdb_id}`)}" class="movie-card">
            ${
              item.poster
                ? `<img src="${item.poster}" alt="" loading="lazy" />`
                : `<div class="movie-card__placeholder">No poster</div>`
            }
            <div class="movie-card__meta">
              <strong>${escapeHtml(item.title)}</strong>
            </div>
          </a>
          <button type="button" class="link-btn" data-id="${item.id}">Remove</button>
        `;
        card.querySelector("button").addEventListener("click", async () => {
          await removeFromWatchlist(item.id);
          card.remove();
          if (!grid.children.length) {
            grid.innerHTML = `<p class="muted">No saved movies yet.</p>`;
          }
        });
        grid.appendChild(card);
      });
    }
  } catch (err) {
    grid.innerHTML = `<p class="muted">${escapeHtml(err.message)}</p>`;
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
