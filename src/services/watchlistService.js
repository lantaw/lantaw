import { getSupabase } from "../lib/supabase.js";
import { getUser } from "./authService.js";

const TABLE = "watchlist";

async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Sign in to manage your watchlist");
  return user;
}

export async function listWatchlist() {
  await requireUser();

  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToWatchlist({ tmdbId, title, poster }) {
  const user = await requireUser();

  const { data, error } = await getSupabase()
    .from(TABLE)
    .upsert(
      [
        {
          user_id: user.id,
          tmdb_id: tmdbId,
          title,
          poster: poster || null,
        },
      ],
      { onConflict: "user_id,tmdb_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromWatchlist(id) {
  await requireUser();

  const { error } = await getSupabase().from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function removeByTmdbId(tmdbId) {
  const user = await requireUser();

  const { error } = await getSupabase()
    .from(TABLE)
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId);

  if (error) throw error;
}

export async function isInWatchlist(tmdbId) {
  const user = await getUser();
  if (!user) return false;

  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("id")
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
