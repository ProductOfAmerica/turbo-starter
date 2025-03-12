<h1 style="display:flex; align-items:center;">
  <img src=".github/images/turbo-logo.avif" alt="Turborepo Logo" style="margin-right:10px;" height="32"> Turborepo Starter
</h1>

A modern, turbocharged monorepo template for building Next.js apps with ease. Packed with **Next.js 15**, **Turborepo**,
**Shadcn UI**, and **Biome.js**, this starter is your shortcut to a fast, scalable, and beautiful web project—all
wrapped in a Docker-friendly setup.

[![Stars](https://img.shields.io/github/stars/ProductOfAmerica/turbo-starter?style=social)](https://github.com/ProductOfAmerica/turbo-starter)
[![Node.js](https://img.shields.io/badge/Node.js-v22.12.0+-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-v10.6.2-orange)](https://pnpm.io/)
[![Build Status](https://github.com/ProductOfAmerica/turbo-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/ProductOfAmerica/turbo-starter/actions)

---

## ✨ Why This Starter?

- **Monorepo Magic**: [Turborepo](https://turbo.build/repo) optimizes builds and caching across apps and packages.
- **Next.js 15**: The latest [Next.js](https://nextjs.org/) with Turbopack for blazing-fast development.
- **Shadcn UI**: Beautiful, accessible React components paired with [Tailwind CSS](https://tailwindcss.com/).
- **Biome.js**: A single, speedy tool for linting and formatting—no ESLint/Prettier mess.
- **Docker Ready**: Spin up with [Docker Compose](https://docs.docker.com/compose/) for consistent environments.
- **pnpm Workspaces**: Efficient dependency management with [pnpm](https://pnpm.io/).

Perfect for developers who want a cutting-edge stack without the setup hassle.

---

## 🗂️ Project Structure

```
├── apps/
│   └── web/                # Next.js 15 app
├── packages/
│   ├── ui/                 # Shadcn UI components & utilities
│   └── typescript-config   # Shared TypeScript settings
├── docker-compose.yml      # Docker setup
├── turbo.json              # Turborepo config
└── pnpm-workspace.yaml     # Workspace definitions
```

---

## 🛠️ Get Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.12.0+)
- [pnpm](https://pnpm.io/) (`npm i -g pnpm@10.6.2`)
- [Docker](https://www.docker.com/) (optional, for containerized dev)

### Setup

```bash
git clone https://github.com/ProductOfAmerica/turbo-starter.git
cd turbo-starter
pnpm install
```

### Run Locally

```bash
pnpm dev           # Start the Next.js app
pnpm turbo check-types  # Type checking
```

### Build

```bash
pnpm build         # Build all apps and packages
```

### Docker

```bash
pnpm docker        # Launch with Docker Compose
pnpm docker:build  # Rebuild containers
```

---

## 🎨 Code Quality

Keep your code sharp with [Biome.js](https://biomejs.dev/):

```bash
pnpm format-write  # Format code
pnpm lint         # Check for issues
pnpm lint:fix     # Auto-fix issues
```

---

## 🌟 Bonus Features

- **Remote Caching**: Connect to [Vercel](https://vercel.com/) for faster builds:
  ```bash
  npx turbo login
  npx turbo link
  ```
- **Shared UI**: Reuse components and utilities from `packages/ui` across projects.

---

## 🤝 Contribute

Love this starter? Star it, fork it, or submit a PR! Let’s make it even better together.

- [Issues](https://github.com/ProductOfAmerica/turbo-starter/issues)
- [Docs](https://turbo.build/repo/docs)

---

Built with ❤️ by [ProductOfAmerica](https://github.com/ProductOfAmerica). Happy coding!