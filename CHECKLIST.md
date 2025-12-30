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
- [x] Configuration Sheet (match config, trading params, API status)
- [x] Command Palette (⌘K)
- [x] Stop Confirmation Dialog

## Phase 6: Hooks & State
- [x] use-bot-state.ts (state machine, elapsed timer)
- [x] use-keyboard-shortcuts.ts (global shortcuts)
- [x] use-trading-toasts.ts (toast notifications)
- [x] Update use-trading-stream.ts for new events

## Phase 7: API Routes
- [x] POST /api/bot/start
- [x] POST /api/bot/stop
- [x] POST /api/bot/pause
- [x] POST /api/bot/resume
- [x] GET /api/bot/status

## Phase 8: Bot Service
- [x] Create trading-bot.ts singleton service
- [x] Integrate with existing SSE stream

## Phase 9: Polish
- [x] Loading skeletons for stat cards (StatsCardsSkeleton)
- [x] Chart loading state (centered spinner)
- [x] Feed empty states (Radio icon, TrendingUp icon)
- [x] Toast notifications (trades, connection, bot status, significant events)
- [x] Animations (pulse, transitions, hover effects)
- [x] Responsive breakpoints (sm/md/lg/xl)

## Quality Checks
- [x] All 7 bot states handled (IDLE, STARTING, RUNNING, PAUSED, STOPPING, STOPPED, ERROR)
- [x] All 3 connection states handled (connected, reconnecting, disconnected)
- [x] Loading skeletons for initial load
- [x] Empty states for feeds
- [x] Error states with retry actions
- [x] Keyboard shortcuts working (⌘K, ⌘,, Space, ⌘Enter, ⌘D, ⌘E, ?)
- [x] Context menus functional (chart, events, trades)
- [x] Command palette complete (actions, navigation, export, help)
- [x] Responsive at all breakpoints (header hides text on mobile, stat cards 2/3/6 cols)
- [x] Animations smooth (pulse for live, transitions on hover)
- [x] Toast notifications wired up (Sonner with rich colors)
