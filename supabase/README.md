# Supabase setup

## 1. Run migrations

Dashboard → **SQL Editor** → run in order:

1. `migrations/202603260001_init_auth_and_watchlist.sql`
2. `migrations/202603260002_google_profile_fields.sql`

## 2. Enable Google login (Gmail)

### A. Google Cloud Console

1. Create (or open) a project at [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services → Credentials → Create credentials → OAuth client ID**
3. Application type: **Web application**
4. Authorized JavaScript origins:
   - `http://localhost`
5. Authorized redirect URIs (copy from Supabase Google provider screen):
   - `https://xzsynwcpzljzgaghetem.supabase.co/auth/v1/callback`
6. Copy **Client ID** and **Client Secret**

### B. Supabase Dashboard

1. **Authentication → Providers → Google** → Enable
2. Paste Client ID + Client Secret → Save

### C. URL configuration

**Authentication → URL Configuration**

- Site URL: `http://localhost/movie/`
- Redirect URLs: `http://localhost/movie/**`

## 3. App behavior

The PWA redirects to `#/login` until a Google session exists. After OAuth, Supabase returns to the Site URL and the session is stored in the browser.
