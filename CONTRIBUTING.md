# Contributing to Turborepo Starter

Thanks for your interest in contributing!

## Prerequisites

- [Node.js](https://nodejs.org/) v24.13.0+ (use `nvm use` or [Volta](https://volta.sh/))
- [pnpm](https://pnpm.io/) v10.28.1 (`npm i -g pnpm@10.28.1`)

## Setup

```bash
git clone https://github.com/ProductOfAmerica/turbo-starter.git
cd turbo-starter
pnpm install
pnpm dev
```

## Code Quality

Before submitting a PR, make sure everything passes:

```bash
pnpm lint          # Biome lint + format check
pnpm check-types   # TypeScript type checking
pnpm build         # Production build
```

Auto-fix lint issues:

```bash
pnpm lint:fix
```

## Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Ensure `pnpm lint`, `pnpm check-types`, and `pnpm build` all pass
4. Open a PR with a clear description of what you changed and why

## Project Structure

- `apps/web/` — Next.js 16 application
- `packages/ui/` — Shared UI components (shadcn/radix)
- `packages/typescript-config/` — Shared TypeScript config

## Questions?

Open an [issue](https://github.com/ProductOfAmerica/turbo-starter/issues) and we'll help.
