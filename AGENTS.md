# CLAUDE.md

## Checks

CI (`.github/workflows/ci.yml`) runs the same set.

```bash
pnpm lint                       # Biome lint + format check; pnpm lint:fix repairs
pnpm check-types
pnpm build
pnpm test:e2e                   # Playwright; pnpm test:e2e <pattern> runs matching files
pnpm build:storybook            # then: node scripts/check-stories.mjs --manifest
pnpm test                       # unit tests and every story as a test (light, then dark); fails below 100% coverage per file
pnpm audit --audit-level=high
```

## Gotchas

- `pnpm test:e2e` does not build. Its web server is `next start`, which serves whatever `.next` holds, so run `pnpm build` first or the tests hit stale code. Outside CI it reuses anything already listening on :3000.
- `apps/web/src/proxy.ts` is the middleware (Next 16 renamed `middleware.ts`). Its CSP is an allowlist: add any new third-party origin (script, fetch, iframe, font, plain `<img>`) there, or the browser blocks it with nothing but a console error.
- Shadcn components belong in `packages/ui`, which holds the repo's only `components.json`. Use the Shadcn MCP to find items, examples, and its audit checklist; it installs nothing, so add components with `pnpm dlx shadcn@latest add <component> -c packages/ui`.
- Don't hand-edit CLI-written files; `--overwrite` discards edits. `biome.json` disables the rules upstream trips there instead. Exceptions, to re-apply after an overwrite: `item.tsx` drops `role="list"`, and `calendar`, `combobox`, `scroll-area` and `slider` carry accessibility fixes (marked `Edited after the shadcn CLI`; their stories fail without them). Prop JSDoc is allowed in any of them; after an overwrite, `node scripts/check-stories.mjs --manifest` lists the descriptions to re-add.
- `@repo/ui` exports pin file extensions: `components/*` and `hooks/*` resolve to `.tsx`, `lib/*` to `.ts` (plus an explicit `lib/highlighter` entry). The CLI writes hooks as `.ts`; rename them.
- Never put user input in a `ChartConfig`: `chart.tsx` writes it unescaped into a `<style>` tag.
- Storybook runs from apps/web (config in `.storybook/`). UI stories live in `packages/ui/stories`, app stories in `apps/web/stories/web`, each mirroring its package's source. `.claude/rules/storybook.md` loads with UI files and has the conventions; hooks in `.claude/settings.json` run the related story tests after edits and before you stop.
- `pnpm storybook` (port 6006) also serves the Storybook MCP server at `/mcp` (`.mcp.json`). It exists only while Storybook runs: start Storybook before Claude Code, or reconnect from `/mcp`.
- Stories stay out of the production build: Next type-checks with `apps/web/tsconfig.build.json`, `turbo.json` drops `stories/` from every package's `build` inputs, and `globals.css` scans only `packages/ui/src` and excludes the app's `stories/` (`.storybook/preview.css` adds both story folders back for Storybook).
- Coverage is 100% per file, with the exceptions listed in `apps/web/vitest.config.mts`. Code no story can reach gets a test in `packages/ui/tests` (runs in Chromium) or next to its app source as `*.test.ts(x)` (runs in Node); the report is in `apps/web/coverage`.
- `pnpm test` needs Chromium once for the story tests: `pnpm --filter web exec playwright install chromium`. It doesn't need a build.
