# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Context

This repo IS a developer-facing product: a Turborepo boilerplate template that developers clone/fork to start new Next.js projects. Every change affects developer experience. Treat README quality, onboarding friction, and getting-started time as first-class concerns, not afterthoughts.

## Commands

```bash
pnpm dev                          # Start Next.js dev server (Turbopack)
pnpm build                        # Build all apps and packages
pnpm check-types                  # TypeScript type-check across the monorepo
pnpm lint                         # Biome lint + format check
pnpm lint:fix                     # Biome auto-fix
pnpm format-write                 # Biome format (write)
pnpm lint:ci                      # CI variant (enforces LF line endings)
cd apps/web && pnpm test:e2e      # Playwright E2E tests (builds first, runs on :3000)
cd apps/web && pnpm analyze       # Next.js bundle analyzer (set ANALYZE=true)
pnpm docker                       # Rebuild and start Docker containers
```

## Architecture

Turborepo monorepo with pnpm workspaces. Two workspace roots: `apps/*` and `packages/*`. Node.js and pnpm versions are Volta-pinned (see `volta` field in root `package.json`).

### `apps/web`
Next.js 16 app (App Router). Uses `@/*` path alias mapping to `./src/*`. The `proxy.ts` file at `src/proxy.ts` is Next.js middleware that injects security headers (CSP, HSTS, etc.) on all non-static routes. Vercel Analytics and Web Vitals are wired in via the root layout. E2E tests live in `apps/web/e2e/` and use Playwright with a `webServer` config that auto-starts `pnpm start` on port 3000.

### `packages/ui`
Shared component library built on Shadcn UI + Radix primitives. This is where **all** Shadcn components live -- not in the web app. The `components.json` at the package root configures Shadcn CLI to target this package. Components are exported via path-based exports: `@repo/ui/components/*`, `@repo/ui/lib/*`, `@repo/ui/hooks/*`.

### `packages/typescript-config`
Shared `tsconfig` presets: `base.json`, `nextjs.json`, `react-library.json`. Both `apps/web` and `packages/ui` extend from these.

### CSS/Tailwind
Tailwind CSS v4 using the `@import` / `@theme` syntax (no `tailwind.config.ts`). The design system (colors, spacing, shadows, typography scale, dark mode) is defined in `packages/ui/src/globals.css`. The web app's `globals.css` imports it via `@import "@repo/ui/globals.css"` and adds a `@source` directive to scan the UI package for classes.

## Code Style (Biome)

Biome handles both linting and formatting (no ESLint or Prettier):
- **Tabs**, indent width **3**, line width **120**
- **CRLF** line endings (the CI job enforces **LF** via `lint:ci`)
- Single quotes, trailing commas (`es5`), semicolons always, arrow parens always
- Import organization is automatic (`organizeImports: "on"`)
- `noExplicitAny` is a warning globally but an error in `packages/ui`
- Accessibility rules are enabled for both `apps/web` and `packages/ui`

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`: security audit, Biome lint, type check, build, Playwright E2E. Dependabot is configured with auto-merge for patch/minor updates.

## MCP Servers

`.mcp.json` configures `next-devtools` and `shadcn` MCP servers. Use the Shadcn MCP for component operations (adding/auditing components) instead of the CLI directly.