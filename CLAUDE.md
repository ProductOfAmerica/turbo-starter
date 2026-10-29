# CLAUDE.md

## Checks

CI (`.github/workflows/ci.yml`) runs the same set.

```bash
pnpm lint                       # Biome lint + format check; pnpm lint:fix repairs
pnpm check-types
pnpm build
pnpm test:e2e                   # Playwright; pnpm test:e2e <pattern> runs matching files
pnpm audit --audit-level=high
```

## Gotchas

- `pnpm test:e2e` does not build. Its web server is `next start`, which serves whatever `.next` holds, so run `pnpm build` first or the tests hit stale code. Outside CI it reuses anything already listening on :3000.
- `apps/web/src/proxy.ts` is the middleware (Next 16 renamed `middleware.ts`). Its CSP is an allowlist: add any new third-party origin (script, fetch, iframe, font, plain `<img>`) there, or the browser blocks it with nothing but a console error.
- Shadcn components belong in `packages/ui`, which holds the repo's only `components.json`. Use the Shadcn MCP to find items, examples, and its audit checklist; it installs nothing, so add components with `pnpm dlx shadcn@latest add <component> -c packages/ui`.
- Don't hand-edit CLI-written files; `--overwrite` discards edits. `biome.json` disables the rules upstream trips there instead. Sole exception: `item.tsx` drops `role="list"`; re-apply after an overwrite.
- `@repo/ui` exports pin file extensions: `components/*` and `hooks/*` resolve to `.tsx`, `lib/*` to `.ts` (plus an explicit `lib/highlighter` entry). The CLI writes hooks as `.ts`; rename them.
- Never put user input in a `ChartConfig`: `chart.tsx` writes it unescaped into a `<style>` tag.
