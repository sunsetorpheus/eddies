# Eddies — notes for Claude

Personal finance PWA. Tracks monthly **commitments** (rent, loans, subs): a
list you maintain, marked paid per month, plus a Profile with your income and
what's left after commitments.

## Data model (Supabase)

- `profiles` — `id`, `username`, `monthly_income` (nullable)
- `commitments` — `id`, `user_id` (default `auth.uid()`), `name`, `amount`,
  `due_day` (1–31), `category` (see `CATEGORIES` in commitments/types.ts),
  `active`
- `payments` — `id`, `user_id`, `commitment_id`, `month` (1st of month, e.g.
  `2026-09-01`), `paid_at`. One row = "this commitment was paid that month".
  Unique on `(commitment_id, month)`. Monthly "reset" is just the absence of
  rows for the new month.

All tables have RLS: one policy per operation, all check `user_id = auth.uid()`.

## Structure: group by feature, not by file type

```
src/
  app.tsx              routing only
  components/ui/        shadcn primitives, shared
  lib/                  generic shared code (supabase.ts, utils.ts)
  features/<name>/      a feature's components, hooks, types, and DB queries
```

- A new feature is a new folder. Don't add loose files to `src/`.
- Features don't import each other's internals — shared code moves to `lib/`.
- No barrel (`index.ts`) files. Hooks live with their feature.
- DB access goes through a feature hook, not inline in components.

All authed-app data (commitments, payments, profile) lives in one shared
context: `CommitmentsProvider` in `features/commitments/commitments-store.tsx`,
consumed via `useCommitments()`. One fetch, one `reload()`, writes update it
optimistically then re-fetch. `app.tsx` wraps the authed routes in it.

Profile page edits: username + income go through the store (`setUsername`,
`setIncome`). Password change stays local to the component — it verifies the
current password with a throwaway `signInWithPassword`, then
`supabase.auth.updateUser({ password })`.

## Naming

- Files: kebab-case (`auth-form.tsx`, `use-session.ts`). Matches `components/ui/`.
- Component names and types inside: PascalCase (`AuthForm`). Hooks: `useThing`.

## Design

Dark-only, matching shadcn/ui's default dark theme: pure-neutral near-black
ground, near-white primary, mid-grey accent. No light theme, no theme toggle,
`next-themes` removed. Tokens live in `src/index.css` on bare `:root`.

- Two surface steps: page (`--background`) → cards (`--card`). Depth from a 1px
  border, not heavy shadows.
- Semantic colour is the only chroma: `--paid` / `--due` / `--overdue`, meaning
  a commitment's state and nothing else.
- Page titles: `text-2xl font-bold tracking-tight` + a one-line muted
  description. Money uses `.tabular-nums`.
- Shared bits: `<Bar>` (progress track — animates `scaleX`, never `width`) in
  `components/ui/`.
- Add shadcn components with `npx shadcn@latest add <name>`; the CLI writes
  `import { cn } from "cn"` — change it to `@/lib/utils` after.

## Motion

Native only, no animation library. `index.css` has the setup.

- Animate `transform` / `opacity` only. Never `width`/`height`/`box-shadow`,
  never `transition-all`.
- Durations 120–300ms, ease-out for things appearing.
- `prefers-reduced-motion` is handled globally in one block — don't re-handle
  per component.
- Mark-paid does an optimistic update wrapped in `withTransition()` (View
  Transitions API) so the list re-sorts smoothly; rows carry
  `viewTransitionName`.
- Page content fades in via `.animate-in-up`, keyed by top-level route section
  in the shell.

## Before calling a change done

Run `npm run lint` and `npm run build`. Leave tests to the user.

Known false-positive lint warnings — don't chase:
- `only-export-components` (`button.tsx`, `commitments-store.tsx`) — file
  exports a component plus a constant/hook.
- `set-state-in-effect` (`commitments-store.tsx`) — the effect calls an async
  `reload()`, so setState runs after an await. Standard fetch-on-mount.
