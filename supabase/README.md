# Supabase setup

## 1. Run migrations

Dashboard → **SQL Editor** → run in order:

1. `migrations/202603260001_init_auth_and_watchlist.sql`
2. `migrations/202603260002_google_profile_fields.sql`

## 2. Enable Google login (Gmail)

### A. Google Cloud Console

1. [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Open your **Web application** OAuth client
3. **Authorized JavaScript origins** — add:
   - `http://localhost`
   - `https://lantaw.netlify.app`
4. **Authorized redirect URIs** — keep:
   - `https://xzsynwcpzljzgaghetem.supabase.co/auth/v1/callback`
5. Save

### B. Supabase Dashboard

1. **Authentication → Providers → Google** → Enable + Client ID/Secret
2. **Authentication → URL Configuration**
   - **Site URL:** `https://lantaw.netlify.app`
   - **Redirect URLs** (add all you use):
     - `https://lantaw.netlify.app/**`
     - `http://localhost/movie/**`
     - `http://localhost/**`

## 3. Deploy

Push to Git → Netlify auto-deploys from repo root (`netlify.toml` publish = `.`).
