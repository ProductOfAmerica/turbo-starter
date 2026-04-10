# Project Conventions

## Monorepo Structure

Turborepo monorepo with pnpm workspaces.

- `apps/web` — Next.js 16 web application
- `packages/ui` — Shared UI components (shadcn/radix)
- `packages/typescript-config` — Shared TypeScript configuration

## Tooling

- **Package manager:** pnpm 10.28.1 (specified in `package.json` `packageManager` field)
- **Node.js:** 24.13.0 (Volta-pinned)
- **Bundler/Dev server:** Turbopack (via Next.js)
- **Linter/Formatter:** Biome (`pnpm lint` runs `biome check .`)
- **Type checker:** TypeScript (`pnpm check-types` runs `turbo check-types` -> `tsc --noEmit`)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (turbo) |
| `pnpm build` | Production build (turbo) |
| `pnpm lint` | Biome lint + format check |
| `pnpm check-types` | TypeScript type checking |
| `pnpm lint:fix` | Auto-fix lint issues |

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Security audit (`pnpm audit --audit-level=high`)
3. Lint and format check
4. Type check
5. Build
6. E2E smoke test (Playwright)

## Dependency Management

- **Dependabot** with weekly schedule, patch/minor only (major versions ignored)
- **Auto-merge** for Dependabot PRs after CI passes (`.github/workflows/dependabot-auto-merge.yml`)
- Groups: `react-ecosystem`, `next-ecosystem`, `development`

## Telemetry

All telemetry is disabled:
- `NEXT_TELEMETRY_DISABLED=1`
- `TURBO_TELEMETRY_DISABLED=1`
- `DO_NOT_TRACK=1`
