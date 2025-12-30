# Esports Trading Dashboard - Implementation Checklist

## Phase 1: Layout & Core Structure
- [x] Update types.ts with BotStatus, BotState, Stats, Config
- [x] Create header.tsx (app name, match info, command button, settings)
- [x] Create status-bar.tsx (7 states, controls, dry run toggle)
- [x] Create dashboard/page.tsx (layout structure)
- [x] Update index.ts exports

## Phase 2: Stat Cards (6 total)
- [x] P&L Card (accent border, win rate, colored value)
- [x] Model Probability Card (team indicator, delta)
- [x] Market Price Card (YES/NO prices)
- [x] Edge Card (tradeable indicator, threshold ring)
- [x] Position Card (shares, direction badge, exposure)
- [x] Activity Card (trade count, event count)

## Phase 3: Chart Card
- [x] Time range selector (1m, 5m, 15m, All)
- [x] More options dropdown (export, toggle lines)
- [x] Chart context menu
- [x] Legend (Model, Market, Blue Event, Red Event)
- [x] Custom tooltip with edge display

## Phase 4: Feeds
- [x] Events Feed with filter dropdown
- [x] Events context menu (show on chart, filter, copy)
- [x] Events empty state
- [x] "X new" indicator for scrolled feeds
- [x] Trades Feed with HoverCard details
- [x] Trades empty state

## Phase 5: Overlays & Dialogs
- [ ] Configuration Sheet (match config, trading params, API status)
- [ ] Command Palette (⌘K)
- [ ] Stop Confirmation Dialog

## Phase 6: Hooks & State
- [ ] use-bot-state.ts (state machine, elapsed timer)
- [ ] use-keyboard-shortcuts.ts (global shortcuts)
- [ ] Update use-trading-stream.ts for new events

## Phase 7: API Routes
- [ ] POST /api/bot/start
- [ ] POST /api/bot/stop
- [ ] POST /api/bot/pause
- [ ] POST /api/bot/resume
- [ ] GET /api/bot/status

## Phase 8: Bot Service
- [ ] Create trading-bot.ts singleton service
- [ ] Integrate with existing SSE stream

## Phase 9: Polish
- [ ] Loading skeletons for stat cards
- [ ] Chart loading state
- [ ] Feed loading states
- [ ] Toast notifications (Baron, Elder, Roshan, Aegis)
- [ ] Animations (pulse, transitions)
- [ ] Responsive breakpoints (sm/md/lg/xl)

## Quality Checks
- [ ] All 7 bot states handled
- [ ] All 3 connection states handled
- [ ] Loading skeletons for initial load
- [ ] Empty states for feeds
- [ ] Error states with retry actions
- [ ] Keyboard shortcuts working
- [ ] Context menus functional
- [ ] Command palette complete
- [ ] Responsive at all breakpoints
- [ ] Animations smooth
- [ ] Toast notifications wired up
