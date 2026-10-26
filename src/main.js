import { createApp } from "./App.js";
import { getSession } from "./services/authService.js";
import { assetUrl } from "./config/base.js";

async function boot() {
  // Let Supabase finish Google OAuth (?code=...) before routing
  try {
    await getSession();
  } catch (_) {
    /* still show login gate */
  }

  const root = document.getElementById("app");
  const app = createApp(root);
  app.mount();
}

boot();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(assetUrl("/sw.js")).catch(() => {
      /* offline cache optional */
    });
  });
}
