Build the esports trading dashboard.

## Before Starting

1. Read `docs/DASHBOARD_SPEC.md` thoroughly — every component, state, and interaction is specified
2. Read `docs/refactoring_ui.md` for design principles you must follow
3. Explore existing codebase:
    - How shadcn components are used in `@repo/ui`
    - Existing page layouts and patterns
    - Current color tokens and CSS variables
4. DO NOT write code until you've created a plan and I've approved it

## Planning Phase

Think hard about this task. Then:

1. Create `CHECKLIST.md` in the project root with every component to build
2. Group by: Layout → Components → Hooks → API Routes → Polish
3. Note any ambiguities or decisions needed
4. Present the plan for my approval

## Implementation Phase

After plan approval:

1. Build page layout structure first
2. Create each component section by section
3. Check off items in `CHECKLIST.md` as you complete them
4. Test each state variation before moving on
5. Verify responsive behavior at breakpoints

## Quality Checks

Before marking complete:

- [ ] All 7 bot states handled (IDLE, STARTING, RUNNING, PAUSED, STOPPING, STOPPED, ERROR)
- [ ] All 3 connection states handled (connected, reconnecting, disconnected)
- [ ] Loading skeletons for initial load
- [ ] Empty states for feeds
- [ ] Error states with retry actions
- [ ] Keyboard shortcuts working
- [ ] Context menus functional
- [ ] Command palette complete
- [ ] Responsive at sm/md/lg/xl breakpoints
- [ ] Animations smooth (pulse, transitions)
- [ ] Toast notifications wired up

## Key Reminders

- This is a MONITORING dashboard — user watches, bot trades automatically
- P&L is the most important metric — make it prominent
- Use semantic colors from CSS variables, never arbitrary
- Numbers must use `font-mono tabular-nums`
- Follow button hierarchy: `default` > `secondary` > `ghost`
- Feeds need auto-scroll behavior and "X new" indicators