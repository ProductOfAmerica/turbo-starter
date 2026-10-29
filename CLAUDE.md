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
- `biome.json` sets `lineEnding: "crlf"`, which only matches Windows checkouts. On an LF checkout (macOS, Linux, CI) `pnpm lint` fails every file and `pnpm lint:fix` rewrites them all to CRLF; use `pnpm lint:ci` there.
- `apps/web/src/proxy.ts` is the middleware (Next 16 renamed `middleware.ts`). Its CSP is an allowlist: add any new third-party origin (script, fetch, iframe, font, plain `<img>`) there, or the browser blocks it with nothing but a console error.
- Shadcn components belong in `packages/ui`, which holds the repo's only `components.json`. Use the Shadcn MCP to find items, examples, and its audit checklist; it installs nothing, so add components with `pnpm dlx shadcn@latest add <component> -c packages/ui`.
- `@repo/ui` exports pin file extensions: `components/*` and `hooks/*` resolve to `.tsx`, `lib/*` to `.ts`. A file with the other extension won't resolve from the app, which is why `use-mobile.tsx` keeps its `.tsx`.
