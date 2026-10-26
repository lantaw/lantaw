import { getSession, signInWithGoogle } from "../services/authService.js";

export async function LoginView(root) {
  const session = await getSession();
  if (session) {
    location.hash = "#/";
    return { unmount() {} };
  }

  root.innerHTML = `
    <section class="auth auth--gate">
      <p class="brand">Movie</p>
      <h1>Sign in to continue</h1>
      <p class="muted">Use your Google account. You must log in before browsing.</p>

      <p class="auth-error" id="auth-error" hidden></p>

      <button type="button" class="btn btn--google" id="google-btn">
        <span class="btn--google__icon" aria-hidden="true">G</span>
        Continue with Google
      </button>
    </section>
  `;

  const errorEl = root.querySelector("#auth-error");
  const googleBtn = root.querySelector("#google-btn");

  googleBtn.addEventListener("click", async () => {
    errorEl.hidden = true;
    googleBtn.disabled = true;
    try {
      await signInWithGoogle();
      // Browser redirects to Google, then back here
    } catch (err) {
      errorEl.textContent = err.message || "Google sign-in failed";
      errorEl.hidden = false;
      googleBtn.disabled = false;
    }
  });

  return { unmount() {} };
}
