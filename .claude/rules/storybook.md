---
paths:
  - "packages/ui/src/components/**"
  - "packages/ui/stories/**"
  - "packages/ui/tests/**"
  - "apps/web/src/**/*.tsx"
  - "apps/web/stories/**"
  - "apps/web/.storybook/**"
---

# UI work: reuse components, document them in stories, prove it with story tests

## Before you build

- Reuse before you write. With the Storybook MCP server connected (it runs while `pnpm storybook` does), call `docs-list`, then `docs-show` on the candidates. Without it, run `pnpm --filter web exec storybook tools docs list` and `... docs show --id ui-button` (an undocumented CLI that reads the same docs without a server), or read the stories in `packages/ui/stories` and `apps/web/stories`.
- Use only props that the docs or stories show. Docgen leaves out props from Radix, Base UI and native elements, so each component's description lists those it takes.
- The manifest has no props or description for Combobox and for app components that take no props; read their story files instead.
- Import UI components from `@repo/ui/components/<name>` and app components with `@/`. The manifest's import line for app components says `from 'web'`, which doesn't resolve.
- New reusable UI goes in `packages/ui`; add shadcn components with `pnpm dlx shadcn@latest add <component> -c packages/ui`, and don't hand-edit the files the CLI writes. App-only UI goes in `apps/web/src/components`.

## Stories

Every component has a story file, and a change to a component updates its story: a new prop or variant gets a story, and changed behavior gets its play function updated. `scripts/check-stories.mjs` maps sources to story files and lists the exempt components:

- `packages/ui/src/components/x.tsx` → `packages/ui/stories/x.stories.tsx`
- `apps/web/src/components/**/x.tsx` → `apps/web/stories/web/components/**/x.stories.tsx`
- `apps/web/src/app/**/{page,error,not-found,loading}.tsx` → `apps/web/stories/web/app/**`

The one Storybook, configured in `apps/web/.storybook`, renders both folders and serves `apps/web/public`, so a story can use `/og.webp`. Copy the shape of a neighboring story:

- CSF 3: `const meta = { component: X } satisfies Meta<typeof X>`, with test helpers from `storybook/test`. Types come from `@storybook/react` in `packages/ui` (it doesn't depend on Next.js, so use `<img>`, not next/image) and from `@storybook/nextjs-vite` in `apps/web`.
- JSDoc on `meta` says what the component is for, when to use something else instead, its props (including the library and native ones), and ends with a one-line `@summary`. JSDoc on each story says what it shows and why you'd use it. The MCP docs tools serve this text to agents, so keep it accurate. `docs-show` prints the first three stories in full but only about 90 characters of each other story's JSDoc, so end a longer one with a one-line `@summary`.
- Every prop gets a JSDoc description where it's declared, which the MCP docs show next to it: above the prop in the component's type, above the key in `cva({ variants })` for a variant, or, for a prop only a dependency declares, in a typed redeclaration in the signature (`& { /** ... */ open?: React.ComponentProps<typeof X>['open'] }`). `asChild` is exempt. A description in a story's `argTypes` doesn't reach the MCP docs. `node scripts/check-stories.mjs --manifest` fails on a missing one.
- List compound parts in `subcomponents`, and show the canonical composition.
- Write a story for each variant, size and state that the component styles, one concept per story: agents copy each story's snippet as a usage example. For anything that renders in a portal, add a story with it open, and query it with `screen`.
- A story that renders the same as another and exists for its play function (keyboard navigation, Escape, a failure path) gets `tags: ['!manifest']`: it still runs as a test, but stays out of the docs agents read.
- Give interactive behavior a play function. Put `fn()` spies in the args of the story that asserts them, not in `meta`, where every snippet would show them. A handler on a subcomponent can't be an arg: use a module-level `fn()` cleared in the story's `beforeEach`.
- Keep stories deterministic: fixed dates, `spyOn(navigator.clipboard, 'writeText')`, `globals: { viewport: { value: 'mobile1' } }` for mobile layouts, and `findBy*` or `waitFor` with a timeout for async content. Story tests run at 1200x900 unless a story sets a viewport, with animations off.

## Coverage

`pnpm test` fails when a file drops below 100% coverage. The few exceptions, code no test can reach in CLI-written components, are listed in `apps/web/vitest.config.mts`.

- Cover new code with a story first. A prop, state or interaction worth testing is worth documenting.
- For code no sensible story reaches (a hook's guard that throws outside its provider, a default the preview always overrides), write a test: `packages/ui/tests/<name>.test.tsx` for packages/ui (it runs in Chromium, like the stories), `apps/web/src/**/<name>.test.ts(x)` next to the source for the app (it runs in Node).
- Don't import a component a story renders into an app test: that project compiles it differently, so coverage counts its code twice and the copy no test runs stays uncovered.

## Accessibility

Every story runs axe, and in both themes a violation fails it.

- Fix violations in code you write or change. Fix semantic problems (names, roles, labels) yourself; ask before changing colors or other visual design.
- A violation in a CLI-written `packages/ui` component: ask the user before editing the file. If they agree, start the comment at the edit with `Edited after the shadcn CLI:` and add the file to the list in CLAUDE.md.
- A violation you can't fix (a library's markup, or a design the user keeps): skip only that rule on only the flagged element, with `parameters: { a11y: { config: { rules: [{ id: '<rule>', selector: '<the rule's own selector>:not(<element>)' }] } } }`. The rule's own selector is in axe-core's rule metadata, `*` when it has none (`[role]` for aria-required-children). Put a comment right above `parameters` that starts `// a11y exception, <rule>:` and says why, then tell the user. Don't use `test: 'todo'`: in CI it silences every rule for the story.

## Run the checks

- With the MCP server connected, run stories with its `test-run` tool. Otherwise run `pnpm test` (unit tests and stories, both themes), or one file with `pnpm --filter web exec vitest run ../../packages/ui/stories/button.stories.tsx` (paths are relative to `apps/web`), and in the dark theme with `pnpm --filter web exec cross-env STORY_THEME=dark vitest run ../../packages/ui/stories/button.stories.tsx`.
- `test-run` checks the light theme only: it ignores `globals`, so `{ theme: 'dark' }` changes nothing. The hooks and `pnpm test` run dark too, or use the dark command above.
- `test-run` silently leaves out stories from a story file created after Storybook started: they show as neither passing nor failing. Check that every story you asked for appears in its output, and run a new file with the Vitest command above.
- A new machine needs Chromium once: `pnpm --filter web exec playwright install chromium`.
- `node scripts/check-stories.mjs` lists missing stories and accessibility exceptions. After `pnpm build:storybook`, add `--manifest` to also check the docs the MCP server serves.
- Hooks in `.claude/settings.json` run the related story tests after your edits and again before you finish, along with the missing-story and type checks; failures come back to you to fix.
