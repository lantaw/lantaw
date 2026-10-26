import { getSupabase } from "../lib/supabase.js";

function appRedirectUrl() {
  // Stay on this PWA after Google OAuth (hash router)
  const { origin, pathname } = window.location;
  return `${origin}${pathname}`;
}

export async function getSession() {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Google / Gmail sign-in via Supabase OAuth */
export async function signInWithGoogle() {
  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: appRedirectUrl(),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

/** Subscribe to auth changes. Returns unsubscribe fn. */
export function onAuthChange(callback) {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function displayNameFromUser(user) {
  if (!user) return "";
  const meta = user.user_metadata || {};
  return (
    meta.full_name ||
    meta.name ||
    meta.display_name ||
    user.email ||
    "Signed in"
  );
}
