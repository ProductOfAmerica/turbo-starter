# Contributing to Turborepo Starter

Thanks for your interest in contributing!

## Prerequisites

- [Node.js](https://nodejs.org/), at least the version in `.nvmrc` (use `nvm use` or [Volta](https://volta.sh/))
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`); it switches to the version pinned in `package.json` on its own

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
pnpm lint             # Biome lint + format check
pnpm check-types      # TypeScript type checking
pnpm build            # Production build
pnpm test             # Unit tests, and every story as a test (interactions, accessibility, both themes)
```

Auto-fix lint issues:

```bash
pnpm lint:fix
```

Story tests run in Chromium, which needs installing once per machine:
`pnpm --filter web exec playwright install chromium`.

## Components and Stories

A new or changed component needs a story: in `packages/ui/stories` for a UI component, in `apps/web/stories/web` for
an app one. `.claude/rules/storybook.md` has the conventions, and `node scripts/check-stories.mjs` lists missing
stories and every accessibility exception. `pnpm test` also fails if a file drops below 100% coverage: cover new code
with a story, or with a test in `packages/ui/tests` or next to the app source where no story can reach it.

Storybook's packages are pinned to one exact version in `apps/web` and `packages/ui`. Upgrade them together: run
`pnpm --filter web exec storybook upgrade`, then set `storybook` and `@storybook/react` in `packages/ui` to the same
version. Dependabot doesn't open major updates.

## Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Ensure `pnpm lint`, `pnpm check-types`, `pnpm build`, and `pnpm test` all pass
4. Open a PR with a clear description of what you changed and why

## Project Structure

- `apps/web/` — Next.js 16 application
- `packages/ui/` — Shared UI components (shadcn/radix)
- `packages/typescript-config/` — Shared TypeScript config

## Questions?

Open an [issue](https://github.com/ProductOfAmerica/turbo-starter/issues) and we'll help.
