-- Movie app: profiles + watchlist with Supabase Auth + RLS
-- Run in Supabase Dashboard → SQL Editor, or via supabase db push

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Watchlist (per authenticated user)
-- ---------------------------------------------------------------------------
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  title text not null,
  poster text,
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id)
);

create index if not exists watchlist_user_id_idx on public.watchlist (user_id);
create index if not exists watchlist_tmdb_id_idx on public.watchlist (tmdb_id);

alter table public.watchlist enable row level security;

drop policy if exists "watchlist_select_own" on public.watchlist;
create policy "watchlist_select_own"
  on public.watchlist for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "watchlist_insert_own" on public.watchlist;
create policy "watchlist_insert_own"
  on public.watchlist for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "watchlist_update_own" on public.watchlist;
create policy "watchlist_update_own"
  on public.watchlist for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "watchlist_delete_own" on public.watchlist;
create policy "watchlist_delete_own"
  on public.watchlist for delete
  to authenticated
  using (auth.uid() = user_id);

-- Default user_id on insert from JWT (safe even if client omits it)
create or replace function public.watchlist_set_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  if new.user_id is distinct from auth.uid() then
    raise exception 'user_id must match authenticated user';
  end if;
  return new;
end;
$$;

drop trigger if exists watchlist_set_user_id on public.watchlist;
create trigger watchlist_set_user_id
  before insert on public.watchlist
  for each row execute function public.watchlist_set_user_id();
