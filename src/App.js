import { createRouter } from "./router/index.js";
import { HomeView } from "./views/HomeView.js";
import { MovieView } from "./views/MovieView.js";
import { LoginView } from "./views/LoginView.js";
import { WatchlistView } from "./views/WatchlistView.js";

export function createApp(root) {
  const shell = document.createElement("div");
  shell.className = "app-shell";
  shell.innerHTML = `<main id="view"></main>`;
  root.appendChild(shell);

  const router = createRouter(shell.querySelector("#view"));
  router.add("/", HomeView);
  router.add("/login", LoginView);
  router.add("/watchlist", WatchlistView);
  router.add("/movie/:id", MovieView);

  return {
    mount() {
      router.start();
    },
  };
}
