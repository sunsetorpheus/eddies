# Eddies

Personal finance PWA. Vite + React + Supabase. Install to your phone's home screen.

Tracks monthly **commitments** — rent, loans, subscriptions. Keep the list once,
check each one off as you pay it. The app shows what's still owed this month and
what's left of your income. A new month starts empty; there's no reset.

## Structure

Grouped by feature, not by file type. Each folder under `src/features/` holds its
own components, hooks, types, and DB queries. Shared UI is in `src/components/ui/`,
generic helpers in `src/lib/`. Adding a feature means adding a folder.

- `app.tsx` — routing only
- `features/auth/` — sign in / sign up, session hook
- `features/app-shell/` — sidebar (desktop) + bottom tab bar (phone)
- `features/commitments/` — the list, the month switcher, and `commitments-store.tsx`,
  one shared context that fetches commitments, payments, and profile once
- `features/dashboard/` — summary card + overdue list
- `features/profile/` — username, income, password

## Data (Supabase)

Three tables, all with row-level security keyed to the signed-in user:

- `profiles` — username, optional monthly income
- `commitments` — name, amount, due day (1–31), category, active flag
- `payments` — one row = "this commitment was paid that month"

## Local dev

1. Copy `.env.example` to `.env`, fill in your Supabase URL + anon key.
2. `npm install`
3. `npm run dev`

Before committing: `npm run lint` and `npm run build`.

## Deploy

Static site. Connect this repo to Vercel / Cloudflare Pages / Netlify.
Build command `npm run build`, output dir `dist`.
Set env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host dashboard.
