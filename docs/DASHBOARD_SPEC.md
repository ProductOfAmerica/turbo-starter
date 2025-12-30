# Esports Trading Dashboard — Complete Specification

## Overview

A real-time monitoring dashboard for an automated esports trading bot that trades on Polymarket. This is a **monitoring** interface, not an active trading UI. The bot trades automatically based on Bayesian probability updates from live game events.

### User Goals
1. Start/stop the bot (immediate actions)
2. See if they're making money (P&L is most important)
3. Understand what's happening (events, trades, probability)
4. Configure settings (infrequent)

### Design Philosophy
- **Personality:** Professional, data-focused, trustworthy (money is involved)
- **Density:** Information-rich but not cramped
- **Theme:** Dark mode only (industry standard for trading)
- **Border radius:** Default `--radius: 0.625rem`
- **Font:** System sans-serif, monospace for numbers

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky, h-14, border-b)                                            │
├────────────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (flex-1, overflow-auto, p-6, max-w-7xl mx-auto)               │
│                                                                            │
│  ┌─ STATUS BAR ─────────────────────────────────────────────────────────┐  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─ STAT CARDS (grid, gap-4) ───────────────────────────────────────────┐  │
│  │ [P&L] [Model] [Market] [Edge] [Position] [Activity]                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─ CHART CARD (min-h-[300px]) ─────────────────────────────────────────┐  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─ FEEDS (grid grid-cols-1 lg:grid-cols-2 gap-6) ──────────────────────┐  │
│  │ [Events Feed]                    [Trades Feed]                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘

Overlays:
- Sheet (right): Configuration Panel
- CommandDialog: Command Palette (⌘K)
- AlertDialog: Stop Confirmation
- Toasts (bottom-right): Notifications via Sonner
```

---

## Components

### 1. Header

**Structure:**
- Height: `h-14`
- Styling: `sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`
- Layout: `flex items-center justify-between px-6`

**Left Section:**
- App name: `font-semibold` text "Esports Trading Bot"
- Separator: `orientation="vertical" className="h-6"`
- Match info: `text-sm text-muted-foreground` showing "T1 vs G2 · League of Legends"
- When no match configured: Show "No match selected"

**Right Section:**
- Command button: `variant="outline" size="sm"` with Search icon, placeholder text "Search commands...", and `<kbd>` showing "⌘K"
- Settings button: `variant="ghost" size="icon"` with Settings icon

---

### 2. Status Bar

**Container:**
- Component: Card
- Layout: `flex items-center justify-between p-4`

**Left Section — Status Display:**

Status Badge styling by state:
| State | Badge Classes | Dot Classes | Text |
|-------|---------------|-------------|------|
| IDLE | `border-muted-foreground/50` | `bg-muted-foreground` | "IDLE" |
| STARTING | `border-yellow-500/50 bg-yellow-500/10 text-yellow-600` | `bg-yellow-500 animate-pulse` | "STARTING..." |
| RUNNING | `border-green-500/50 bg-green-500/10 text-green-600` | `bg-green-500 animate-pulse` | "LIVE · {elapsed}" |
| PAUSED | `border-yellow-500/50 bg-yellow-500/10 text-yellow-600` | `bg-yellow-500` | "PAUSED · {elapsed}" |
| STOPPING | `border-yellow-500/50 bg-yellow-500/10 text-yellow-600` | `bg-yellow-500 animate-pulse` | "STOPPING..." |
| STOPPED | `border-muted-foreground/50` | `bg-muted-foreground` | "STOPPED" |
| ERROR | `border-destructive/50 bg-destructive/10 text-destructive` | `bg-destructive` | "ERROR" |

Connection indicator (next to status badge):
- Layout: `flex items-center gap-1.5 text-sm text-muted-foreground`
- Dot: `h-1.5 w-1.5 rounded-full` with `bg-green-500` (connected) or `bg-destructive` (disconnected)
- Text: "Connected" or "Disconnected"

**Center Section — Controls:**

| State | Buttons Shown |
|-------|---------------|
| IDLE | [▶ Start Bot] (default variant) |
| STARTING | [Starting...] (disabled, with Loader2 animate-spin) |
| RUNNING | [⏸ Pause] (secondary), [■ Stop] (destructive) |
| PAUSED | [▶ Resume] (default), [■ Stop] (destructive) |
| STOPPING | [Stopping...] (disabled, with Loader2 animate-spin) |
| STOPPED | [▶ Start Bot] (default) |
| ERROR | [↻ Retry] (default), [⚙ Configure] (secondary) |

Button structure:
- Icon: `mr-2 h-4 w-4`
- All buttons include appropriate icons (Play, Pause, Square, RotateCcw, Settings)

**Right Section — Dry Run Toggle:**
- Layout: `flex items-center gap-3`
- Label: `text-sm text-muted-foreground` "Dry Run"
- Switch component
- When enabled, show Badge: `variant="secondary"` with classes `bg-yellow-500/10 text-yellow-600 border-yellow-500/50` text "SIMULATED"

---

### 3. Stat Cards

**Grid Layout:**
- Container: `grid gap-4`
- Responsive columns:
    - Default: `grid-cols-2`
    - `lg`: `grid-cols-3`
    - `xl`: `grid-cols-6`

**Card Base Structure:**
```
CardContent className="p-4"
  ├─ Row 1: Label + Icon (flex items-center justify-between)
  │   ├─ Label: text-sm font-medium text-muted-foreground
  │   └─ Icon: h-4 w-4 text-muted-foreground
  ├─ Row 2: Primary Value (mt-2 text-2xl font-bold font-mono tabular-nums)
  └─ Row 3: Secondary Info (mt-1 text-xs text-muted-foreground)
```

#### Card 1: Total P&L

- Icon: TrendingUp (colored based on P&L)
- Special styling: Top accent border `absolute inset-x-0 top-0 h-1` colored green/red
- Card border: `border-green-500/20` or `border-red-500/20`
- Primary value: Format as currency with +/- sign, colored `text-green-600` or `text-red-600`
- Secondary: "{tradeCount} trades · {winRate}% win rate"

#### Card 2: Model Probability

- Icon: Brain
- Primary value: "{probability}%" (e.g., "54.2%")
- Secondary row:
    - Team indicator dot: `h-2 w-2 rounded-full` colored `bg-blue-500` (>50%) or `bg-red-500` (<50%)
    - Text: "{Blue/Red} favored"
    - Change indicator: `ml-auto` with ▲/▼ and percentage change, colored green/red

#### Card 3: Market Price

- Icon: DollarSign
- Primary value: "{price}¢" (e.g., "49.1¢")
- Secondary: "YES {yesPrice}¢ / NO {noPrice}¢"

#### Card 4: Edge

- Icon: Zap (colored green when tradeable)
- Special styling when tradeable (|edge| >= threshold): `ring-2 ring-green-500/50` on card
- Primary value: "{edge}%" with +/- sign, colored `text-green-600` when tradeable
- Secondary row:
    - When tradeable: Pulsing dot `h-2 w-2 rounded-full bg-green-500 animate-pulse` + "Tradeable" in `text-green-600 font-medium`
    - When not: "Below {threshold}% threshold"

#### Card 5: Position

- Icon: Wallet
- Primary value: "{shares} shares" (shares in text-2xl, "shares" in text-base font-normal)
- Secondary row:
    - Badge showing position direction with appropriate colors:
        - LONG: `border-green-500/50 text-green-600`
        - SHORT: `border-red-500/50 text-red-600`
        - FLAT: `border-muted-foreground/50 text-muted-foreground`
    - Exposure amount: "{currency} exposure"

#### Card 6: Activity

- Icon: Activity
- Primary value: "{tradeCount}"
- Secondary: "trades today · {eventCount} events"

---

### 4. Chart Card

**Card Structure:**
- Component: Card
- Contains: CardHeader + CardContent

**CardHeader:**
- Layout: `flex flex-row items-center justify-between pb-2`
- Left side:
    - CardTitle: `text-base font-medium` "Win Probability Over Time"
    - CardDescription: "Model prediction vs market price"
- Right side controls:
    - Time range selector (segmented control)
    - More options dropdown

**Time Range Selector:**
- Container: `inline-flex items-center rounded-md border bg-muted p-1`
- Options: ["1m", "5m", "15m", "All"]
- Each button: `variant="ghost" size="sm" className="h-7 px-2.5 text-xs"`
- Active state: `bg-background shadow-sm`

**More Options Dropdown:**
- Trigger: `variant="ghost" size="icon" className="h-8 w-8"` with MoreHorizontal icon
- Menu items:
    - Eye icon + "Toggle Market Line"
    - Eye icon + "Toggle Event Markers"
    - Separator
    - Download icon + "Export as PNG"
    - FileDown icon + "Export Data as CSV"

**Chart Area:**
- Wrapper: ContextMenu with ContextMenuTrigger around chart
- Height: `h-[300px]`
- Use Recharts ResponsiveContainer + LineChart

**Chart Elements:**
1. Reference line at 50%: `stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.3}`
2. Model line: `type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={false}`
3. Market line: `type="monotone" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="4 4" dot={false}`
4. Event markers: ReferenceDot with `r={4}` colored by team (blue-500 or red-500), white stroke
5. Trade markers: Vertical reference lines at execution times

**Chart Axes:**
- XAxis: `axisLine={false} tickLine={false}` with muted foreground text
- YAxis: `domain={[0, 100]}` with percentage formatter

**Chart Tooltip:**
- Custom tooltip showing:
    - Time
    - Model: {value}%
    - Market: {value}%
    - Edge: {value}%

**Context Menu Items:**
- "Reset Zoom" with Maximize2 icon
- Separator
- CheckboxItem "Show Model Line"
- CheckboxItem "Show Market Line"
- CheckboxItem "Show Event Markers"
- Separator
- "Export as PNG" with Download icon

**Legend (below chart):**
- Layout: `mt-4 flex items-center justify-center gap-6 text-sm`
- Items: Model (solid line), Market (dashed line), Blue Event (blue dot), Red Event (red dot)

---

### 5. Events Feed Card

**Card Structure:**
- Component: Card with `className="flex flex-col"`
- Contains: CardHeader + CardContent

**CardHeader:**
- Layout: `flex flex-row items-center justify-between pb-2`
- Left:
    - CardTitle: `text-base font-medium` "Game Events"
    - CardDescription: "Real-time match feed"
- Right:
    - "New" button (when scrolled up): `variant="ghost" size="sm" className="h-7 text-xs"` text "{count} new ↓"
    - Filter dropdown

**Filter Dropdown:**
- Trigger: `variant="outline" size="sm" className="h-7"` with Filter icon
- Content: RadioGroup with options:
    - "All Events"
    - "Kills"
    - "Objectives"
    - "Structures"

**CardContent:**
- Container: `className="flex-1 p-0"`
- ScrollArea: `className="h-[320px]"`
- Inner container: `className="space-y-1 p-4 pt-0"`

**Event Item Structure:**
```
ContextMenu
  └─ ContextMenuTrigger
       └─ div (group, hover:bg-muted/50, border-l-2 colored by team)
            ├─ Timestamp: text-xs text-muted-foreground font-mono tabular-nums w-16
            └─ Content div
                 ├─ Row 1: Badge (event type) + Team name (text-sm font-medium)
                 ├─ Row 2: Description (text-sm text-muted-foreground truncate)
                 └─ Row 3 (optional): Detail (text-xs text-muted-foreground)
            └─ Hover action button: opacity-0 group-hover:opacity-100
```

**Event Types:**

LoL Events:
| Type | Description Format | Detail Example |
|------|-------------------|----------------|
| KILL | "{killer} → {victim}" | "First Blood · +500 gold" |
| DRAGON | "{type} Drake" | "3rd dragon for {team}" |
| BARON | "Baron Nashor" | "Buff expires in 3:00" |
| HERALD | "Rift Herald" | "Summoned mid lane" |
| TOWER | "{lane} {tier} Tower" | "First tower bonus" |
| INHIBITOR | "{lane} Inhibitor" | "Respawns in 5:00" |

Dota Events:
| Type | Description Format | Detail Example |
|------|-------------------|----------------|
| KILL | "{killer} → {victim}" | "Beyond Godlike" |
| ROSHAN | "Roshan" | "Aegis to {player}" |
| TOWER | "{lane} {tier} Tower" | "Glyph available" |
| BARRACKS | "{lane} Barracks" | "Mega creeps soon" |

**Event Context Menu:**
- "Show on Chart" with LineChart icon
- "Filter to {type}" with Filter icon
- Separator
- "Copy Details" with Copy icon

**Empty State:**
```
div (flex flex-col items-center justify-center py-12 text-center)
  └─ Icon container: rounded-full bg-muted p-3 mb-4
       └─ Radio icon: h-6 w-6 text-muted-foreground
  └─ Heading: font-medium "Waiting for events"
  └─ Description: text-sm text-muted-foreground mt-1 "Events will appear when the match goes live"
```

---

### 6. Trades Feed Card

**Card Structure:**
- Same as Events Feed

**CardHeader:**
- CardTitle: "Trade Executions"
- CardDescription: "{count} today · {wins} won · {losses} lost · {totalPnL}"
- Right: Dropdown with "Export as CSV" and "Clear History"

**Trade Item Structure:**
```
HoverCard
  └─ HoverCardTrigger asChild
       └─ div (group, hover:bg-muted/50, cursor-pointer)
            ├─ Status icon (h-4 w-4 shrink-0)
            │   ├─ Filled: CheckCircle text-green-500
            │   ├─ Pending: Loader2 text-yellow-500 animate-spin
            │   └─ Rejected: XCircle text-destructive
            ├─ Content div (flex-1)
            │   ├─ Row 1: Side Badge + Size/Price + SIMULATED badge (if applicable)
            │   └─ Row 2: Edge + Timestamp (text-xs text-muted-foreground)
            └─ P&L (text-sm font-medium font-mono, colored green/red)
```

**Side Badge:**
- BUY: `variant="default"`
- SELL: `variant="secondary"`

**SIMULATED Badge:**
- `variant="outline" className="text-xs border-yellow-500/50 text-yellow-600"`

**HoverCard Content:**
- Width: `w-80`
- Structure:
  ```
  div (space-y-2)
    ├─ Header row: "Order Details" + Order ID badge
    ├─ Separator
    ├─ Grid (grid-cols-2 gap-2 text-sm)
    │   ├─ Side: label + value
    │   ├─ Size: label + value (font-mono)
    │   ├─ Price: label + value (font-mono, 4 decimals)
    │   ├─ Total: label + value (font-mono)
    │   ├─ Edge at Execution: label + value (font-mono, percentage)
    │   └─ Fill Time: label + value
    ├─ Separator (only if not simulated)
    └─ Link to Polymarket (only if not simulated)
  ```

**Empty State:**
```
div (flex flex-col items-center justify-center py-12 text-center)
  └─ Icon container: rounded-full bg-muted p-3 mb-4
       └─ TrendingUp icon: h-6 w-6 text-muted-foreground
  └─ Heading: font-medium "No trades yet"
  └─ Description: text-sm text-muted-foreground mt-1 "Trades execute automatically when edge exceeds {threshold}%"
```

---

### 7. Configuration Sheet

**Trigger:** Settings button in header

**SheetContent:**
- Width: `className="w-[400px] sm:w-[540px] overflow-y-auto"`

**SheetHeader:**
- SheetTitle: "Configuration"
- SheetDescription: "Configure match tracking and trading parameters"

**Body Structure:**
- Container: `className="space-y-8 py-6"`
- Sections separated by Separator component

#### Section 1: Match Configuration

**Section Header:**
- `className="text-sm font-medium text-muted-foreground uppercase tracking-wide"`
- Text: "Match Configuration"

**Fields:**

1. Game Select:
    - Label: "Game"
    - Select with options:
        - value="lol" label="League of Legends"
        - value="dota" label="Dota 2"

2. Match ID:
    - Label: "Match ID"
    - Layout: Input + Verify button in flex row
    - Input has validation indicator inside (CheckCircle green or XCircle red)
    - Input border changes: `border-green-500` (valid) or `border-destructive` (invalid)
    - Button: `variant="secondary"` text "Verify"
    - Help text: "Find match IDs on PandaScore or the game's esports site"

3. Market ID:
    - Label: "Market ID (Optional)"
    - Input with placeholder "Auto-detect from match"
    - Help text: "Override automatic market detection"

4. Match Preview (shown after validation):
    - Container: `rounded-lg border bg-muted/50 p-4`
    - Content: Team names, tournament, status badge

#### Section 2: Trading Parameters

**Section Header:** "Trading Parameters"

**Fields:**

1. Edge Threshold:
    - Label row: "Edge Threshold" + current value display
    - Slider: min=1, max=20, step=0.5
    - Help text: "Minimum edge required to execute trades"

2. Order Size:
    - Label: "Order Size ($)"
    - Input type="number" min=1 max=1000

3. Max Position:
    - Label: "Max Position ($)"
    - Input type="number" min=10 max=10000
    - Help text: "Maximum total exposure before pausing trades"

4. Polling Interval:
    - Label: "Polling Interval"
    - Select with options: "1s", "2s", "5s"

#### Section 3: API Status

**Section Header:** "API Status"

**Status Items:**
- Container: `className="space-y-2"`
- Each item: `flex items-center justify-between rounded-md border px-3 py-2`
- Structure: Status dot + Name on left, Detail on right

| API | Detail |
|-----|--------|
| Polymarket | "Wallet: 0x1234...5678" (truncated) |
| PandaScore | null |
| OpenDota | null |

Status dot colors:
- Connected: `bg-green-500`
- Error: `bg-destructive`
- Checking: `bg-yellow-500 animate-pulse`

**SheetFooter:**
- "Reset to Defaults" button: `variant="outline"`
- "Save Configuration" button: `variant="default"`

---

### 8. Command Palette

**Trigger:** ⌘K keyboard shortcut or clicking command button in header

**Component:** CommandDialog

**Structure:**
```
CommandDialog
  └─ CommandInput placeholder="Type a command or search..."
  └─ CommandList
       └─ CommandEmpty "No results found."
       └─ CommandGroup heading="Actions"
       └─ CommandSeparator
       └─ CommandGroup heading="Navigation"
       └─ CommandSeparator
       └─ CommandGroup heading="Export"
       └─ CommandSeparator
       └─ CommandGroup heading="Help"
```

**Commands:**

Actions:
| Icon | Label | Shortcut |
|------|-------|----------|
| Play | Start Bot | ⌘Enter |
| Pause | Pause Bot | Space |
| Square | Stop Bot | — |
| FlaskConical | Toggle Dry Run | ⌘D |

Navigation:
| Icon | Label | Shortcut |
|------|-------|----------|
| Settings | Open Configuration | ⌘, |
| LineChart | Focus Chart | — |
| Radio | Focus Events | — |
| TrendingUp | Focus Trades | — |

Export:
| Icon | Label | Shortcut |
|------|-------|----------|
| Download | Export Trade History | ⌘E |
| Image | Export Chart as PNG | — |

Help:
| Icon | Label | Shortcut |
|------|-------|----------|
| Keyboard | Keyboard Shortcuts | ? |

---

### 9. Stop Confirmation Dialog

**Component:** AlertDialog

**Trigger:** Stop button (when running or paused)

**AlertDialogContent:**

**Header:**
- AlertDialogTitle: "Stop Trading Bot?"
- AlertDialogDescription contains:
    - Paragraph: "This will end the current trading session."
    - Summary box: `rounded-md border bg-muted/50 p-3 space-y-1`
        - Row: "Session P&L" + value (colored)
        - Row: "Open Position" + "{shares} shares {LONG/SHORT}"
    - Warning: `text-sm text-yellow-600 flex items-center gap-2` with AlertTriangle icon
        - "Open positions will remain open on Polymarket"

**Footer:**
- AlertDialogCancel: "Cancel"
- AlertDialogAction: "Stop Bot" with `className="bg-destructive text-destructive-foreground hover:bg-destructive/90"`

---

### 10. Toast Notifications

**Library:** Sonner

**Toast Types:**

| Event | Type | Title | Description | Action |
|-------|------|-------|-------------|--------|
| Trade executed | success | "Trade Executed" | "Bought {size} @ ${price} · +${edge} edge" | — |
| Trade failed | error | "Trade Failed" | "{reason}" | "Deposit" button (if funds issue) |
| Connection lost | warning | "Connection Lost" | "Attempting to reconnect..." | duration: Infinity, id: "connection" |
| Connection restored | success | "Reconnected" | "Connection restored. Resuming data feed." | — |
| Bot started | default | "Bot Started" | "Trading in {DRY RUN/LIVE} mode" | — |
| Bot stopped | default | "Bot Stopped" | "Session ended. Final P&L: {value}" | "View Summary" button |
| Significant event | default | "{event}" | "{description}" | Custom icon by event type |

Significant events to toast:
- Baron/Elder Dragon taken
- Inhibitor destroyed
- Roshan killed

---

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| ⌘K | Open command palette | Global |
| ⌘, | Open configuration | Global |
| Space | Pause/Resume | When RUNNING or PAUSED |
| ⌘Enter | Start bot | When IDLE |
| ⌘D | Toggle dry run | Global |
| ⌘E | Export trades | Global |
| Escape | Close dialogs/sheets | When overlay open |
| ? | Show shortcuts help | Global |

---

## Data Types

```typescript
type BotStatus = 'IDLE' | 'STARTING' | 'RUNNING' | 'PAUSED' | 'STOPPING' | 'STOPPED' | 'ERROR';

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface BotState {
  status: BotStatus;
  connection: ConnectionStatus;
  error: string | null;
  dryRun: boolean;
  elapsed: number; // seconds
  matchId: string | null;
  gameType: 'lol' | 'dota' | null;
}

interface Stats {
  pnl: number;
  pnlPercent: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  modelProbability: number;
  modelProbabilityDelta: number;
  marketPrice: number;
  yesPrice: number;
  noPrice: number;
  edge: number;
  edgeThreshold: number;
  position: number; // positive = long, negative = short
  exposure: number;
  eventCount: number;
}

interface ChartDataPoint {
  timestamp: number;
  model: number;
  market: number;
  edge: number;
}

interface GameEvent {
  id: string;
  type: 'KILL' | 'DRAGON' | 'BARON' | 'HERALD' | 'TOWER' | 'INHIBITOR' | 'ROSHAN' | 'BARRACKS';
  team: 'blue' | 'red' | 'radiant' | 'dire';
  timestamp: Date;
  description: string;
  detail?: string;
  probability: number; // model probability at time of event
}

interface Trade {
  id: string;
  orderId: string;
  status: 'pending' | 'filled' | 'rejected';
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
  total: number;
  edge: number;
  pnl: number;
  timestamp: Date;
  fillTime?: string;
  simulated: boolean;
  rejectReason?: string;
}

interface Config {
  game: 'lol' | 'dota';
  matchId: string;
  marketId?: string;
  edgeThreshold: number;
  orderSize: number;
  maxPosition: number;
  pollingInterval: number;
}
```

---

## API Routes

### GET /api/bot/status
Returns current BotState + Stats

### POST /api/bot/start
Body: `{ gameType: string, matchId: string }`
Starts the trading bot

### POST /api/bot/stop
Stops the trading bot

### POST /api/bot/pause
Pauses trading (continues monitoring)

### POST /api/bot/resume
Resumes trading

### GET /api/bot/stream
SSE endpoint streaming real-time updates:
- Event: `stats` — Updated stats object
- Event: `event` — New game event
- Event: `trade` — Trade execution
- Event: `chart` — New chart data point

---

## Environment Variables

```env
# Polymarket
POLY_PRIVATE_KEY=           # Wallet private key
POLY_FUNDER_ADDRESS=        # Optional: proxy wallet address

# Market tokens
POLYMARKET_ID=              # Market condition ID
POLY_YES_TOKEN_ID=          # YES outcome token
POLY_NO_TOKEN_ID=           # NO outcome token

# Game data APIs
PANDASCORE_API_KEY=         # For LoL live data

# Mode
DRY_RUN=true                # Simulate trades without execution
```

---

## Styling Rules

### Typography

| Element | Classes |
|---------|---------|
| Primary value | `text-2xl font-bold font-mono tabular-nums` |
| Secondary value | `text-sm font-medium` |
| Label | `text-sm font-medium text-muted-foreground` |
| Description | `text-sm text-muted-foreground` |
| Help text | `text-sm text-muted-foreground` |
| Timestamp | `text-xs font-mono tabular-nums text-muted-foreground` |
| Section header | `text-sm font-medium text-muted-foreground uppercase tracking-wide` |
| Card title | `text-base font-medium` |

### Colors (use CSS variables only)

| Purpose | Light Text | Background | Border |
|---------|------------|------------|--------|
| Positive/Profit | `text-green-600` | `bg-green-500/10` | `border-green-500/50` |
| Negative/Loss | `text-red-600` | `bg-red-500/10` | `border-red-500/50` |
| Warning/Simulated | `text-yellow-600` | `bg-yellow-500/10` | `border-yellow-500/50` |
| Blue team | `text-blue-500` | — | — |
| Red team | `text-red-500` | — | — |
| Muted | `text-muted-foreground` | `bg-muted` | `border-border` |

### Spacing

| Context | Gap/Padding |
|---------|-------------|
| Major sections | `gap-6` or `space-y-6` |
| Cards in grid | `gap-4` |
| Inside cards | `p-4` |
| Form field groups | `space-y-6` |
| Label to input | `gap-3` |
| Icon to text | `gap-2` |
| Badge content | `gap-1.5` |
| Feed items | `space-y-1` |

### Responsive Breakpoints

| Breakpoint | Stat Grid | Feeds |
|------------|-----------|-------|
| Default (<640px) | 2 columns | Stacked |
| `sm` (640px) | 2 columns | Stacked |
| `md` (768px) | 3 columns | Stacked |
| `lg` (1024px) | 3 columns | Side by side |
| `xl` (1280px) | 6 columns | Side by side |

---

## Animations

| Element | Animation |
|---------|-----------|
| Status badge (LIVE) | `animate-pulse` on dot |
| Status badge (STARTING/STOPPING) | `animate-pulse` on dot |
| Loader icons | `animate-spin` |
| Tradeable edge indicator | `animate-pulse` on dot |
| New feed items | Fade + slide in (framer-motion optional) |
| Number changes | Count up/down animation (framer-motion optional) |
| Buttons | `transition-transform hover:scale-105` (subtle) |
| Cards | `transition-shadow hover:shadow-md` |
| Hover reveal buttons | `opacity-0 group-hover:opacity-100 transition-opacity` |

---

## Loading States

### Stat Cards Loading
- Use Skeleton components:
    - `Skeleton className="h-4 w-20 mb-2"` (label)
    - `Skeleton className="h-8 w-24 mb-1"` (value)
    - `Skeleton className="h-3 w-32"` (secondary)

### Chart Loading
- Centered in chart area:
    - `Loader2 className="h-8 w-8 animate-spin text-muted-foreground"`
    - Text: "Loading chart data..."

### Feed Loading
- Either Skeleton items or centered spinner

### Reconnecting Overlay
- Full screen: `fixed inset-0 z-50 bg-background/80 backdrop-blur-sm`
- Centered Card with:
    - Loader2 spinning
    - "Reconnecting..."
    - Progress bar

---

## Error States

### Inline Error (e.g., failed to fetch)
```
Card className="border-destructive/50"
  └─ CardContent className="p-4"
       └─ div (flex items-start gap-3)
            ├─ Icon container: rounded-full bg-destructive/10 p-2
            │   └─ AlertCircle className="h-4 w-4 text-destructive"
            └─ Content (flex-1)
                 ├─ Heading: font-medium "{error title}"
                 ├─ Description: text-sm text-muted-foreground mt-1
                 └─ Actions: flex gap-2 mt-3
                      ├─ Button size="sm" variant="outline" "Retry"
                      └─ Button size="sm" variant="ghost" "Change Match ID"
```

---

## File Structure (Expected)

```
apps/web/src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                 # Main dashboard page
│   └── api/
│       └── bot/
│           ├── status/route.ts      # GET bot status
│           ├── start/route.ts       # POST start bot
│           ├── stop/route.ts        # POST stop bot
│           ├── pause/route.ts       # POST pause bot
│           ├── resume/route.ts      # POST resume bot
│           └── stream/route.ts      # GET SSE stream
├── components/
│   └── dashboard/
│       ├── header.tsx
│       ├── status-bar.tsx
│       ├── stat-cards.tsx
│       ├── chart-card.tsx
│       ├── events-feed.tsx
│       ├── trades-feed.tsx
│       ├── config-sheet.tsx
│       ├── command-palette.tsx
│       └── stop-dialog.tsx
├── hooks/
│   ├── use-bot-state.ts            # Bot state management
│   ├── use-sse.ts                  # SSE connection hook
│   └── use-keyboard-shortcuts.ts   # Keyboard shortcut handler
├── lib/
│   └── utils.ts                    # Utility functions
└── services/
    ├── trading-bot.ts              # Bot service singleton
    ├── polymarket.ts               # Polymarket client
    ├── predictor.ts                # Bayesian predictor
    └── event-parser.ts             # Game event parsing
```

---

## Checklist for Implementation

- [ ] Page layout structure
- [ ] Header component
- [ ] Status bar with all state variations
- [ ] Stat cards (6 cards with correct data)
- [ ] Chart card with Recharts integration
- [ ] Chart context menu
- [ ] Events feed with filtering
- [ ] Events context menu
- [ ] Events empty state
- [ ] Trades feed with HoverCard
- [ ] Trades empty state
- [ ] Configuration sheet with all fields
- [ ] Command palette with all commands
- [ ] Stop confirmation dialog
- [ ] Toast notifications (Sonner setup)
- [ ] Keyboard shortcuts
- [ ] SSE hook for real-time updates
- [ ] Bot state management
- [ ] API routes
- [ ] Loading states
- [ ] Error states
- [ ] Responsive behavior testing
- [ ] Animation polish