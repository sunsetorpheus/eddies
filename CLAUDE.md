# Eddies — notes for Claude

Personal finance PWA. Auth now, transactions next.

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
- Add shadcn components with `npx shadcn@latest add <name>`; the CLI writes
  `import { cn } from "cn"` — change it to `@/lib/utils` after.

## Before calling a change done

Run `npm run lint` and `npm run build`. Leave tests to the user.
The `button.tsx` `only-export-components` warning is a pre-existing false
positive (exports the component plus `buttonVariants`) — ignore it.
