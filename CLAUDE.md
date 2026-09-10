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

## Before calling a change done

Run `npm run lint` and `npm run build`. Leave tests to the user.
The `button.tsx` fast-refresh warning is pre-existing — ignore it.
