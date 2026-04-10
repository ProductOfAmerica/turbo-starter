<h1 style="display:flex; align-items:center;">
  <img src=".github/images/turbo-logo.avif" alt="Turborepo Logo" style="margin-right:10px;" height="32"> Turborepo Starter
</h1>

A modern, turbocharged monorepo template for building Next.js apps with ease. Packed with **Next.js 16**, **Turborepo**,
**Shadcn UI**, and **Biome.js**, this starter is your shortcut to a fast, scalable, and beautiful web project — all
wrapped in a Docker-friendly setup.

[![Stars](https://img.shields.io/github/stars/ProductOfAmerica/turbo-starter?style=social)](https://github.com/ProductOfAmerica/turbo-starter)
[![Node.js](https://img.shields.io/badge/Node.js-v24.13.0+-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-v10.28.1-orange)](https://pnpm.io/)
[![nextjs](https://img.shields.io/badge/Next.js-16.1.6-blue?logo=nextdotjs)](https://nextjs.org/)
[![tailwindcss](https://img.shields.io/badge/TailwindCSS-4.1.18-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Build Status](https://github.com/ProductOfAmerica/turbo-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/ProductOfAmerica/turbo-starter/actions)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ProductOfAmerica/turbo-starter)

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

Click the button below. Your app will be live in under 2 minutes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ProductOfAmerica/turbo-starter)

### Option 2: Use this template (GitHub)

Click the **"Use this template"** button at the top of this repo. GitHub creates a new repo for you with a clean history.

### Option 3: degit (CLI)

```bash
npx degit ProductOfAmerica/turbo-starter my-app
cd my-app
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

- [Node.js](https://nodejs.org/) v24.13.0+ (use `nvm use` if you have [nvm](https://github.com/nvm-sh/nvm), or [Volta](https://volta.sh/) auto-detects)
- [pnpm](https://pnpm.io/) (`npm i -g pnpm@10.28.1`)
- [Docker](https://www.docker.com/) (optional, for containerized dev)

---

## What's Next?

Once `pnpm dev` is running, here's what to do:

### Add a page

Create a new file at `apps/web/app/about/page.tsx`:

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
| `pnpm lint` | Check for lint and format issues |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm check-types` | TypeScript type checking |
| `pnpm format-write` | Format code |

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
pnpm docker        # Launch with Docker Compose
pnpm docker:build  # Rebuild containers
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get involved.

---

## License

[MIT](LICENSE)

---

Built with care by [ProductOfAmerica](https://github.com/ProductOfAmerica). Happy coding!
