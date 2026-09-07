# Eddies

Personal finance web app. Vite + React + Supabase. PWA — install to phone home screen.

Phase 1 (now): auth only. Phase 2 (later): transactions.

## Local dev

1. Copy `.env.example` to `.env`, fill in your Supabase URL + anon key.
2. `npm install`
3. `npm run dev`

## Deploy

Static site. Connect this repo to Cloudflare Pages / Vercel / Netlify.
Build command `npm run build`, output dir `dist`.
Set env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host dashboard.
