import { getMovieDetail } from "../services/movieService.js";
import { linkTo } from "../router/index.js";
import {
  addToWatchlist,
  isInWatchlist,
  removeByTmdbId,
} from "../services/watchlistService.js";

export async function MovieView(root, params = {}) {
  const id = params.id;

  root.innerHTML = `
    <a class="back" href="${linkTo("/")}">← Back</a>
    <p class="muted">Loading…</p>
  `;

  if (!id) {
    root.innerHTML = `<p class="muted">Missing movie id.</p>`;
    return { unmount() {} };
  }

  try {
    const movie = await getMovieDetail(id);
    const genres = (movie.genres || []).map((g) => g.name).join(" · ");
    let saved = await isInWatchlist(Number(id));

    root.innerHTML = `
      <a class="back" href="${linkTo("/")}">← Back</a>
      <article class="detail">
        ${
          movie.backdrop
            ? `<div class="detail__hero" style="background-image:url('${movie.backdrop}')"></div>`
            : ""
        }
        <div class="detail__body">
          ${
            movie.poster
              ? `<img class="detail__poster" src="${movie.poster}" alt="" />`
              : ""
          }
          <div>
            <h1>${escapeHtml(movie.title)}</h1>
            <p class="muted">${movie.releaseDate || "—"} · ${
              movie.runtime ? `${movie.runtime} min` : "—"
            } · ${movie.rating?.toFixed?.(1) ?? "—"}</p>
            <p class="muted">${escapeHtml(genres)}</p>
            <p>${escapeHtml(movie.overview || "")}</p>
            <div class="detail__actions" id="actions"></div>
          </div>
        </div>
      </article>
    `;

    const actions = root.querySelector("#actions");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn";
    const syncLabel = () => {
      btn.textContent = saved ? "Remove from watchlist" : "Add to watchlist";
    };
    syncLabel();
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        if (saved) {
          await removeByTmdbId(Number(id));
          saved = false;
        } else {
          await addToWatchlist({
            tmdbId: Number(id),
            title: movie.title,
            poster: movie.poster,
          });
          saved = true;
        }
        syncLabel();
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
      }
    });
    actions.appendChild(btn);
  } catch (err) {
    root.innerHTML = `
      <a class="back" href="${linkTo("/")}">← Back</a>
      <p class="muted">${escapeHtml(err.message)}</p>
    `;
  }

  return { unmount() {} };
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
