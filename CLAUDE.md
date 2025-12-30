# Esports Trading Bot

## Commands

- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm clean` - Clean build artifacts and node_modules
- `pnpm format-write` - Format code with Biome
- `pnpm lint` - Run linter
- `pnpm lint:fix` - Run linter and auto-fix issues
- `pnpm lint:ci` - Run linter for CI
- `pnpm check-types` - TypeScript type checking

## Code Style

- TypeScript strict mode, no `any`
- shadcn/ui components from `@repo/ui`
- CSS variables for colors (`bg-primary`, `text-muted-foreground`), never arbitrary values
- Tailwind spacing scale (`gap-4`, `p-6`), never pixel values
- Numbers: always `font-mono tabular-nums`
- Use `cn()` utility for conditional classes

## Architecture

- Next.js App Router in `apps/web`
- Shared UI in `packages/ui`
- API routes for server logic
- SSE for real-time streaming
- Singleton pattern for bot service

## Design Principles

Read `docs/refactoring-ui.md` before building UI. Key rules:

- Hierarchy through weight and color, not just size
- Labels are last resort — combine with values
- Start with too much whitespace
- One primary button per section
- Use component variants for hierarchy (`default` > `secondary` > `ghost`)

## Spec Documents

Read relevant specs before implementing features:

- `docs/DASHBOARD_SPEC.md` - Trading dashboard (complete UI/UX specification)
- `docs/refactoring-ui.md` - Design principles

## Workflow

- Create plan and checklist before coding
- Build incrementally, test each state
- Verify responsive behavior at all breakpoints