<h1><img src=".github/images/turbo-logo.avif" alt="Turborepo Logo" height="32" style="vertical-align: middle;"> Turborepo Starter <a href="https://vercel.com/new/clone?repository-url=https://github.com/ProductOfAmerica/turbo-starter"><img align="right" src="https://vercel.com/button" alt="Deploy with Vercel"></a></h1>

[![Stars](https://img.shields.io/github/stars/ProductOfAmerica/turbo-starter?style=social)](https://github.com/ProductOfAmerica/turbo-starter)
[![Node.js](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FProductOfAmerica%2Fturbo-starter%2Fmain%2Fpackage.json&query=%24.engines.node&label=Node.js&color=green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FProductOfAmerica%2Fturbo-starter%2Fmain%2Fpackage.json&query=%24.volta.pnpm&label=pnpm&color=orange&prefix=v)](https://pnpm.io/)
[![nextjs](https://img.shields.io/github/package-json/dependency-version/ProductOfAmerica/turbo-starter/next?filename=apps%2Fweb%2Fpackage.json&label=Next.js&logo=nextdotjs&color=blue)](https://nextjs.org/)
[![tailwindcss](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FProductOfAmerica%2Fturbo-starter%2Fmain%2Fpnpm-lock.yaml&query=%24.importers%5B%27apps%2Fweb%27%5D.devDependencies.tailwindcss.version&label=TailwindCSS&logo=tailwind-css&color=38B2AC)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000?logo=shadcnui)](https://ui.shadcn.com/)
[![Build Status](https://github.com/ProductOfAmerica/turbo-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/ProductOfAmerica/turbo-starter/actions)

A modern, turbocharged monorepo template for building Next.js apps with ease. Packed with **Next.js 16**, **Turborepo**,
**Shadcn UI**, and **Biome.js**, this starter is your shortcut to a fast, scalable, and beautiful web project — all
wrapped in a Docker-friendly setup.

---

## Why This Starter?

- **Monorepo Magic**: [Turborepo](https://turbo.build/repo) optimizes builds and caching across apps and packages.
- **Next.js 16**: The latest [Next.js](https://nextjs.org/) with Turbopack for blazing-fast development.
- **Shadcn UI**: Beautiful, accessible React components paired with [Tailwind CSS](https://tailwindcss.com/).
- **Biome.js**: A single, speedy tool for linting and formatting — no ESLint/Prettier mess.
- **Docker Ready**: Spin up with [Docker Compose](https://docs.docker.com/compose/) for consistent environments.
- **pnpm Workspaces**: Efficient dependency management with [pnpm](https://pnpm.io/).
- **CI/CD**: GitHub Actions with lint, typecheck, security audit, build, and E2E smoke test.
- **Auto-merge**: Dependabot patches and minor updates auto-merge after CI passes.

Perfect for developers who want a cutting-edge stack without the setup hassle.

---

## Project Structure

```
├── apps/
│   └── web/                # Next.js 16 app
├── packages/
│   ├── ui/                 # Shadcn UI components & utilities
│   └── typescript-config   # Shared TypeScript settings
├── docker-compose.yml      # Docker setup
├── turbo.json              # Turborepo config
└── pnpm-workspace.yaml     # Workspace definitions
```

---

## Get Started

### Option 1: Deploy to Vercel (fastest)

Click the **Deploy** button at the top of this README. Your app will be live in under 2 minutes.

### Option 2: Use this template (GitHub)

Click the **"Use this template"** button at the top of this repo. GitHub creates a new repo for you with a clean history.

### Option 3: degit (CLI)

```bash
npx degit ProductOfAmerica/turbo-starter my-app
cd my-app
git init  # degit copies no .git, and pnpm install sets up git hooks
pnpm install
pnpm dev
```

### Option 4: Clone (for contributors)

```bash
git clone https://github.com/ProductOfAmerica/turbo-starter.git
cd turbo-starter
pnpm install
pnpm dev
```

### Prerequisites

- [Node.js](https://nodejs.org/), at least the version in `.nvmrc` (run `nvm use` with [nvm](https://github.com/nvm-sh/nvm), or let [Volta](https://volta.sh/) pick it up)
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`); it switches to the version pinned in `package.json` on its own
- [Docker](https://www.docker.com/) (optional, to run the production build in a container)

---

## What's Next?

Once `pnpm dev` is running, here's what to do:

### Add a page

Create a new file at `apps/web/src/app/about/page.tsx`:

```tsx
export default function AboutPage() {
  return <h1>About</h1>;
}
```

Visit `http://localhost:3000/about` to see it.

### Add a UI component

Components live in `packages/ui/src/components/`. To use one in your app:

```tsx
import { Button } from '@repo/ui/components/button';
```

### Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com/) for automatic deployments on push.

### Enable Remote Caching

Speed up builds across your team:

```bash
npx turbo login
npx turbo link
```

---

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Build all apps and packages |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Check for lint and format issues |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm check-types` | TypeScript type checking |
| `pnpm format-write` | Format code |
| `pnpm test:e2e` | Run the Playwright E2E suite |

---

## Code Quality

Keep your code sharp with [Biome.js](https://biomejs.dev/):

```bash
pnpm lint          # Check for issues
pnpm lint:fix      # Auto-fix issues
pnpm format-write  # Format code
```

---

## Docker

```bash
pnpm docker        # Build and start (or restart) the app with Docker Compose
pnpm docker:build  # Build the images without starting them
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get involved.

---

## License

[MIT](LICENSE)

---

Built with care by [ProductOfAmerica](https://github.com/ProductOfAmerica). Happy coding!
