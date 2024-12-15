# 🚀 Turborepo Starter

This repository provides a pre-configured **Turborepo** setup with **Next.js 15**, **Tailwind CSS**, **Shadcn UI**, **Docker Compose**, and essential tools like **ESLint**, **Prettier**, **TypeScript**, and **pnpm workspaces**.

## 🛠️ Features

- **Monorepo Architecture**: Built with [Turborepo](https://turbo.build/repo) for efficient builds and caching.
- **Next.js 15**: Latest version of [Next.js](https://nextjs.org/) for modern web development.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI design.
- **Shadcn UI**: A beautiful and accessible component library for React.
- **Docker Compose**: Simplified containerization for local development.
- **ESLint + Prettier**: Code linting and formatting.
- **TypeScript**: Static type checking.
- **pnpm Workspaces**: Dependency management with [pnpm](https://pnpm.io/) for performance and consistency.

---

## 📁 Project Structure

```plaintext
.
├── apps/
│   └── web/               # Next.js 15 app
├── packages/              # Shared packages and components
│   ├── eslint-config         # Shared ESLint configurations
│   ├── typescript-config     # Shared TypeScript configs
│   ├── ui/                   # Shared components (Shadcn UI)
├── .dockerignore          # Docker ignore rules
├── docker-compose.yml
├── turbo.json             # Turborepo configuration
└── pnpm-workspace.yaml
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v22.12.0+)
- **pnpm** (v9.12.0+): Install with `npm i -g pnpm`
- **Docker**: For containerized development

---

### 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ProductOfAmerica/turbo-starter.git
cd turbo-starter
pnpm install
```

---

### 🏗️ Development

Run development mode:

```bash
pnpm dev
```

---

### 🔧 Build

To build all apps and packages:

```bash
pnpm build
```

---

### 🐳 Docker

Start the project using Docker Compose:

```bash
pnpm docker
```

To rebuild the Docker containers explicitly:

```bash
pnpm docker-compose
```

---

### 🧹 Clean

Clean dependencies and build artifacts:

```bash
pnpm clean
```

---

### ✅ Lint & Format

Run ESLint and Prettier:

```bash
pnpm lint
pnpm format
```

---

### ✅ Type Checking
Run TypeScript type checking:

```bash
pnpm check-types
```

---

## 🚀 Remote Caching with Vercel

Enable remote caching for Turborepo:

1. Log in to Vercel:

   ```bash
   npx turbo login
   ```

2. Link your repository:

   ```bash
   npx turbo link
   ```

---

## Additional Notes
### pnpm Workspaces
This project uses pnpm workspaces to manage shared dependencies and modularize the codebase. Shared configurations and libraries are under the packages directory.

### Docker Network
The Docker Compose setup includes an app_network to facilitate communication between containers. Services can reference each other by container name.

## 📚 Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Docker Compose](https://docs.docker.com/compose/)