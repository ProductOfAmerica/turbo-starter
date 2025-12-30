# Refactoring UI + shadcn/ui Design Guide

**Based on:** Refactoring UI by Adam Wathan & Steve Schoger (252 pages)  
**Implementation:** shadcn/ui component library (Tailwind CSS + Radix UI)

A unified design guide for LLMs generating professional interfaces using shadcn/ui components while applying Refactoring
UI principles.

---

## How This Guide Works

shadcn/ui directly implements Refactoring UI principles—systematic color scales, hierarchy-first variants,
constraint-based spacing. This guide maps each design principle to its concrete shadcn/Tailwind implementation.

**Key patterns:**

- Use CSS variables (`bg-primary`, `text-muted-foreground`) not arbitrary colors
- Use Tailwind's spacing scale (`gap-6`, `p-4`) not pixel values
- Use component variants (`variant="secondary"`) for hierarchy
- Use the `cn()` utility for conditional/merged classes

---

## 1. Starting from Scratch

### Start with a feature, not a layout

Don't begin by designing navigation shells. Start with actual functionality and build outward.

### Detail comes later

Design in grayscale first—this forces reliance on spacing, contrast, and size for hierarchy rather than color.

**shadcn implementation:** Start with `bg-background`, `text-foreground`, and `text-muted-foreground` before adding
primary/accent colors.

### Don't design too much

Work in short cycles. Build simple versions first. Be a pessimist—design the smallest useful version.

### Choose a personality

Personality comes from concrete choices:

| Element       | Elegant/Classic     | Playful            | Neutral                        |
|---------------|---------------------|--------------------|--------------------------------|
| Font          | Serif               | Rounded sans-serif | System/neutral sans-serif      |
| Border radius | `--radius: 0`       | `--radius: 1rem`   | `--radius: 0.625rem` (default) |
| Colors        | Muted, gold accents | Bright, pink/teal  | Blue, neutral greys            |

**shadcn implementation:** Modify the `--radius` CSS variable to cascade through all components. Default is `0.625rem` (
10px). The radius scale is computed from this base:

```css
:root {
    --radius: 0.625rem;
    --radius-sm: calc(var(--radius) - 4px); /* 6px */
    --radius-md: calc(var(--radius) - 2px); /* 8px */
    --radius-lg: var(--radius); /* 10px */
    --radius-xl: calc(var(--radius) + 4px); /* 14px */
}
```

### Limit your choices

Pre-define systems. shadcn provides these constraints:

- **Colors:** Semantic variables (`primary`, `secondary`, `muted`, `accent`, `destructive`)
- **Spacing:** Tailwind scale (`gap-2`, `gap-4`, `gap-6`, `p-4`, `p-6`)
- **Radius:** Computed scale (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`)
- **Shadows:** `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`

---

## 2. Hierarchy is Everything

### Not all elements are equal

Visual hierarchy makes interfaces feel "designed." De-emphasize secondary info to make primary content stand out.

### Size isn't everything

Use font weight and color—not just size—to create hierarchy.

**shadcn text hierarchy:**

```
Primary:   text-foreground (dark, high contrast)
Secondary: text-muted-foreground (grey, medium contrast)  
Tertiary:  text-muted-foreground/70 or smaller size
```

**Font weights for UI:**

- Normal: `font-normal` (400) or `font-medium` (500)
- Emphasis: `font-semibold` (600) or `font-bold` (700)
- Never use weights below 400 for UI text

### Don't use grey text on colored backgrounds

Instead of reducing opacity, use the paired foreground variable.

**shadcn implementation:**

```tsx
// ❌ Wrong - grey on colored background
<div className="bg-primary">
    <p className="text-gray-500">Text</p>
</div>

// ✅ Correct - use the foreground pairing
<div className="bg-primary">
    <p className="text-primary-foreground">Text</p>
</div>

// ✅ For subtle text on primary
<div className="bg-primary">
    <p className="text-primary-foreground/70">Subtle text</p>
</div>
```

### Emphasize by de-emphasizing

If an element won't "pop," de-emphasize competing elements instead.

**shadcn patterns:**

- Active nav: `text-foreground font-medium` vs inactive: `text-muted-foreground`
- Competing sidebar? Remove its background, let content sit on page background

### Labels are a last resort

Often format or context makes labels unnecessary. Combine labels with values ("12 left in stock" vs "In stock: 12").

**When labels are needed, treat them as secondary:**

```tsx
<Label className="text-sm font-medium text-muted-foreground">Label</Label>
<p className="text-lg font-semibold">Value</p>
```

### Separate visual hierarchy from document hierarchy

An `<h1>` doesn't have to be huge. Style based on visual needs.

**shadcn typography patterns:**

```
H1: text-4xl font-extrabold tracking-tight lg:text-5xl
H2: text-3xl font-semibold tracking-tight (often with border-b)
H3: text-2xl font-semibold tracking-tight
H4: text-xl font-semibold tracking-tight
```

Section titles often work better as:

```tsx
<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
    Section Title
</h2>
```

### Balance weight and contrast

Heavy elements (icons, bold text) may need lower contrast. Light elements (thin borders) may need more weight.

**shadcn icon pattern:**

```tsx
// Icons are heavy—soften them
<Mail className="h-4 w-4 text-muted-foreground"/>

// Next to text, match hierarchy
<div className="flex items-center gap-2">
    <CheckCircle className="h-4 w-4 text-muted-foreground"/>
    <span>Completed</span>
</div>
```

### Semantics are secondary

Design button hierarchy based on visual importance, not semantic meaning.

**shadcn button hierarchy (pyramid of importance):**

| Role        | Variant                  | Use Case                            |
|-------------|--------------------------|-------------------------------------|
| Primary     | `default`                | Main action, one per section        |
| Secondary   | `secondary` or `outline` | Supporting actions                  |
| Tertiary    | `ghost` or `link`        | Minimal presence actions            |
| Destructive | `destructive`            | Danger, but hierarchy still matters |

**Critical insight:** A destructive action doesn't automatically get `variant="destructive"`. A delete button in a
confirmation modal might use `variant="ghost"` because the modal itself provides context—hierarchy trumps semantics.

```tsx
// Primary action prominent, cancel is tertiary
<DialogFooter>
    <Button variant="ghost">Cancel</Button>
    <Button variant="destructive">Delete Account</Button>
</DialogFooter>

// But if delete is secondary to another action:
<DialogFooter>
    <Button variant="ghost" className="text-destructive">Delete</Button>
    <Button>Save Changes</Button>
</DialogFooter>
```

---

## 3. Layout and Spacing

### Start with too much white space

Add generous space first, then remove until satisfied. Dense UIs should be deliberate.

**shadcn defaults are generous:**

- Card: `py-6` on container, `px-6` on header/content/footer, `gap-6` between sections
- Section gaps: `gap-6` or `space-y-8`
- Form field gaps: `gap-6` between fields, `gap-3` between label and input

### Establish a spacing and sizing system

Use Tailwind's non-linear scale. Values differ by ~25% minimum.

**Recommended spacing usage:**

```
gap-1, gap-1.5  : Tight (icon + text, badge content)
gap-2          : Very related elements (card title + description)
gap-3          : Related elements (label + input)
gap-4          : Within components (card sections)
gap-6          : Between components (form fields, card to card)
gap-8, gap-12  : Major sections
```

### You don't have to fill the whole screen

If 600px is enough, use 600px. Use `max-w-*` constraints.

```tsx
// Centered content with max width
<div className="mx-auto max-w-2xl">
    <Card>...</Card>
</div>

// Form that doesn't need full width
<form className="space-y-6 max-w-md">
    ...
</form>
```

### Grids are overrated

Not everything should be fluid. Sidebars often work better with fixed widths.

```tsx
// Fixed sidebar, flexible main content
<div className="flex">
    <aside className="w-64 shrink-0">...</aside>
    <main className="flex-1 min-w-0">...</main>
</div>
```

### Relative sizing doesn't scale

Large elements shrink faster than small ones on smaller screens. Fine-tune independently.

**Button sizes are independently defined:**

```
sm:      h-9 px-3 text-sm
default: h-10 px-4 py-2 text-sm
lg:      h-11 px-8 text-sm
icon:    h-10 w-10
```

### Avoid ambiguous spacing

Space between groups > space within groups.

**shadcn form pattern:**

```tsx
<form className="space-y-6">           {/* 24px between fields */}
    <div className="grid gap-3">         {/* 12px label to input */}
        <Label>Email</Label>
        <Input/>
    </div>
    <div className="grid gap-3">
        <Label>Password</Label>
        <Input/>
    </div>
</form>
```

---

## 4. Designing Text

### Establish a type scale

Use Tailwind's predefined scale, not arbitrary values.

**shadcn typography scale:**

```
text-xs   : 12px - Badges, helper text
text-sm   : 14px - Labels, secondary text, buttons
text-base : 16px - Body text
text-lg   : 18px - Lead paragraphs
text-xl   : 20px - H4, card titles
text-2xl  : 24px - H3
text-3xl  : 30px - H2
text-4xl  : 36px - H1
text-5xl  : 48px - Hero headlines
```

### Use good fonts

shadcn defaults to system fonts. For custom fonts, ensure 5+ weights available.

```
// System font stack (shadcn default)
font-family: ui-sans-serif, system-ui, sans-serif;

// Or use Inter, which shadcn docs use
import { Inter } from 'next/font/google'
```

### Keep line length in check

45-75 characters per line (20-35em).

```tsx
<p className="max-w-prose">  {/* ~65ch */}
    Long paragraph text...
</p>

// Or explicit character width
<p className="max-w-[65ch]">...</p>
```

### Baseline, not center

Align mixed font sizes by baseline.

```tsx
// ✅ Baseline alignment
<div className="flex items-baseline gap-2">
    <h2 className="text-2xl font-bold">Title</h2>
    <span className="text-sm text-muted-foreground">Subtitle</span>
</div>
```

### Line-height is proportional

Large text needs less line-height. Small text needs more.

**Tailwind line-height:**

```
Headlines: leading-tight (1.25) or leading-none (1)
Body:      leading-normal (1.5) or leading-relaxed (1.625)
```

```tsx
<h1 className="text-4xl font-bold leading-tight">Headline</h1>
<p className="text-base leading-relaxed">Body paragraph...</p>
```

### Not every link needs a color

In link-heavy interfaces, use subtler treatments.

```tsx
// Standard link
<a className="text-primary underline-offset-4 hover:underline">Link</a>

// Subtle link (in nav, footers)
<a className="text-muted-foreground hover:text-foreground transition-colors">Link</a>

// Or use Button with link variant
<Button variant="link">Link</Button>
```

### Use letter-spacing effectively

Tighten headlines, widen all-caps.

```tsx
<h1 className="tracking-tight">Headline</h1>
<span className="text-xs uppercase tracking-wide">Label</span>
```

---

## 5. Working with Color

### Use OKLCH via CSS variables

shadcn uses OKLCH color space for perceptual uniformity. Never use arbitrary hex values—always reference variables.

**Core semantic colors:**

```
--background           /* Page background */
--foreground           /* Default text */
--card                 /* Card backgrounds */
--card-foreground
--popover              /* Popover/dropdown backgrounds */
--popover-foreground
--primary              /* Main actions, brand */
--primary-foreground
--secondary            /* Secondary actions */
--secondary-foreground
--muted                /* Subtle backgrounds */
--muted-foreground     /* De-emphasized text */
--accent               /* Highlights, hovers */
--accent-foreground
--destructive          /* Danger states */
--destructive-foreground
--border               /* Borders */
--input                /* Input borders */
--ring                 /* Focus rings */
```

### You need more colors than you think

shadcn simplifies Refactoring UI's 8-10 shade recommendation into semantic tokens with opacity modifiers.

**Creating shade variations:**

```
bg-primary        // Full strength (500 equivalent)
bg-primary/90     // Hover state (slightly lighter)
bg-primary/10     // Tinted background (100 equivalent)
text-primary/70   // Softer text
```

### Define shades through the variable system

Don't use CSS `lighten()`/`darken()`. The opacity modifier approach handles this.

**For custom palettes, define in CSS:**

```css
:root {
    --primary: oklch(0.6 0.2 250); /* Base blue */
    --primary-foreground: oklch(0.98 0 0); /* White text */
}

.dark {
    --primary: oklch(0.7 0.15 250); /* Lighter for dark mode */
    --primary-foreground: oklch(0.1 0 0); /* Dark text */
}
```

### Greys don't have to be grey

Saturate greys with blue (cool) or yellow/orange (warm).

**shadcn's neutral greys can be replaced with tinted variants:**

```css
:root {
    /* Cool grey (blue tint) */
    --muted: oklch(0.97 0.01 250);
}

/* Or warm grey (orange tint) */
:root {
    --muted: oklch(0.97 0.01 60);
}
```

### Accessible contrast

WCAG: 4.5:1 for normal text, 3:1 for large text.

**shadcn patterns for accessibility:**

```tsx
// Error states
<Input aria-invalid className="border-destructive ring-destructive/20"/>

// Disabled states (reduced but still readable)
<Button disabled className="opacity-50 pointer-events-none"/>
```

### Don't rely on color alone

Use icons and text alongside color.

```tsx
// ❌ Color only
<Badge className="bg-green-500">Active</Badge>

// ✅ Color + icon
<Badge className="bg-green-500">
    <CheckCircle className="h-3 w-3 mr-1"/>
    Active
</Badge>
```

---

## 6. Creating Depth

### Emulate a light source

Light comes from above. Use subtle shadows and border treatments.

**shadcn shadow scale:**

```
shadow-sm  : Subtle lift (cards, dropdowns)
shadow     : Standard elevation
shadow-md  : Popovers, modals
shadow-lg  : High elevation dialogs
shadow-xl  : Maximum depth
```

### Use shadows to convey elevation

Small shadows = slightly raised; large shadows = closer to user.

```tsx
// Resting state
<Card className="shadow-sm">...</Card>

// Hover - increase elevation
<Card className="shadow-sm hover:shadow-md transition-shadow">...</Card>

// Modal - high elevation
<DialogContent className="shadow-lg">...</DialogContent>
```

### Shadows can have two parts

1. Large, soft shadow (direct light)
2. Tight, dark shadow (ambient occlusion)

```tsx
// Custom two-part shadow
className = "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
```

The tight shadow should diminish at higher elevations.

### Even flat designs can have depth

Use color: lighter = closer, darker = further.

```tsx
// Raised element (lighter than background)
<div className="bg-card">...</div>

// Inset element (darker than background)
<div className="bg-muted">...</div>
```

### Overlap elements to create layers

Use negative margins or absolute positioning.

```tsx
// Avatar overlap
<div className="flex -space-x-2">
    <Avatar className="ring-2 ring-background">...</Avatar>
    <Avatar className="ring-2 ring-background">...</Avatar>
</div>
```

The `ring-background` creates an "invisible border" preventing color clash.

---

## 7. Working with Images

### Text needs consistent contrast

Add overlays or shadows for text over images.

```tsx
// Semi-transparent overlay
<div className="relative">
    <img src="..." className="object-cover"/>
    <div className="absolute inset-0 bg-black/50"/>
    <h1 className="absolute bottom-4 left-4 text-white">Title</h1>
</div>

// Text shadow approach
<h1 className="text-white drop-shadow-lg">Title</h1>
```

### Everything has an intended size

Don't scale up small icons—enclose them in shapes.

```tsx
// ❌ Scaled up icon looks chunky
<Mail className="h-12 w-12"/>

// ✅ Icon in a container
<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
    <Mail className="h-6 w-6 text-primary"/>
</div>
```

### Beware user-uploaded content

Use fixed aspect ratio containers.

```tsx
<div className="aspect-video overflow-hidden rounded-lg">
    <img src={userImage} className="h-full w-full object-cover"/>
</div>

// Prevent background bleed with inner shadow
<div className="relative aspect-square rounded-lg overflow-hidden">
    <img src={userImage} className="h-full w-full object-cover"/>
    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg"/>
</div>
```

---

## 8. Finishing Touches

### Supercharge the defaults

Replace bullets with icons. Use custom checkboxes.

```tsx
// Custom list with icons
<ul className="space-y-2">
    {items.map(item => (
        <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500"/>
            <span>{item}</span>
        </li>
    ))}
</ul>
```

### Add color with accent borders

Top borders on cards, side borders on alerts.

```tsx
// Card with top accent
<Card className="border-t-4 border-t-primary">...</Card>

// Alert with side border
<Alert className="border-l-4 border-l-yellow-500">...</Alert>

// Section divider
<div className="w-12 h-1 bg-primary rounded-full"/>
```

### Decorate backgrounds

Use subtle gradients (hues within 30°) or patterns.

```tsx
// Subtle gradient background
<div className="bg-gradient-to-b from-muted/50 to-background">...</div>

// Dot pattern (via CSS)
<div className="bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px]">
```

### Don't overlook empty states

Design engaging empty states with illustrations and clear CTAs.

```tsx
<Card className="flex flex-col items-center justify-center py-12 text-center">
    <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4"/>
    <h3 className="font-semibold">No messages yet</h3>
    <p className="text-sm text-muted-foreground mb-4">
        Start a conversation to see messages here.
    </p>
    <Button>Send a message</Button>
</Card>
```

### Use fewer borders

Use shadows, background colors, or spacing instead.

```tsx
// ❌ Border between items
<div className="divide-y">...</div>

// ✅ Spacing instead
<div className="space-y-4">...</div>

// ✅ Or alternating backgrounds
<div className="odd:bg-muted/50">...</div>
```

### Think outside the box

Dropdowns can have sections and icons. Radio buttons can become selectable cards.

```tsx
// Radio as selectable card
<div className={cn(
    "rounded-lg border-2 p-4 cursor-pointer transition-colors",
    selected ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
)}>
    <div className="flex items-center gap-3">
        <div className={cn(
            "h-4 w-4 rounded-full border-2",
            selected ? "border-primary bg-primary" : "border-muted-foreground"
        )}/>
        <span className="font-medium">Option Label</span>
    </div>
</div>
```

---

## 9. shadcn Component Patterns

### Card structure

```tsx
<Card className="flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
    <CardHeader className="gap-2 px-6">
        <CardTitle className="font-semibold leading-none">Title</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
            Description text
        </CardDescription>
        <CardAction>{/* Optional action button */}</CardAction>
    </CardHeader>
    <CardContent className="px-6">
        {/* Main content */}
    </CardContent>
    <CardFooter className="flex justify-between px-6">
        <Button variant="ghost">Cancel</Button>
        <Button>Save</Button>
    </CardFooter>
</Card>
```

Note: Card uses `bg-card text-card-foreground` by default. The `gap-6` creates consistent vertical rhythm.

### Form structure

```tsx
<form className="space-y-6">
    <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
            id="email"
            type="email"
            placeholder="you@example.com"
        />
        <p className="text-sm text-muted-foreground">
            We'll never share your email.
        </p>
    </div>

    <div className="grid gap-3">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password"/>
    </div>

    <Button type="submit" className="w-full">Sign in</Button>
</form>
```

### Dialog structure

```tsx
<Dialog>
    <DialogTrigger asChild>
        <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
                Description of what this dialog does.
            </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {/* Content */}
        </div>
        <DialogFooter>
            <Button variant="ghost">Cancel</Button>
            <Button>Confirm</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

### Focus and error states

```tsx
// Focus ring pattern (current shadcn - Tailwind v4)
// "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

// Error state
<Input
    aria-invalid={!!error}
    className="aria-invalid:border-destructive aria-invalid:ring-destructive/20"
/>
<p className="text-sm text-destructive">{error}</p>
```

### Dark mode

Dark mode is automatic via CSS variables. Use `next-themes`:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
</ThemeProvider>
```

Never use explicit colors like `bg-white` or `text-black`—always use semantic variables that adapt:

```tsx
// ❌ Won't work in dark mode
<div className="bg-white text-black">

    // ✅ Adapts automatically
    <div className="bg-background text-foreground">
```

---

## Quick Reference

### Spacing scale

```
gap-1 (4px)   gap-2 (8px)   gap-3 (12px)  gap-4 (16px)
gap-5 (20px)  gap-6 (24px)  gap-8 (32px)  gap-10 (40px)
gap-12 (48px) gap-16 (64px)
```

### Common patterns

| Need               | Pattern                                               |
|--------------------|-------------------------------------------------------|
| De-emphasized text | `text-muted-foreground`                               |
| Subtle background  | `bg-muted` or `bg-muted/50`                           |
| Hover state        | `hover:bg-accent` or `hover:bg-primary/90`            |
| Border             | `border border-border`                                |
| Focus ring         | `focus-visible:ring-[3px] focus-visible:ring-ring/50` |
| Disabled           | `disabled:opacity-50 disabled:pointer-events-none`    |
| Error              | `border-destructive text-destructive`                 |

### Button variants

| Variant       | When to use                              |
|---------------|------------------------------------------|
| `default`     | Primary action (one per section)         |
| `secondary`   | Secondary actions                        |
| `outline`     | Alternative secondary style              |
| `ghost`       | Tertiary, minimal actions                |
| `link`        | Text-only link style                     |
| `destructive` | Danger actions (hierarchy still matters) |

### Component sizing

```
Button:  h-9 (sm), h-10 (default), h-11 (lg), h-10 w-10 (icon)
Input:   h-9 (default)
Avatar:  h-8 (sm), h-10 (default), h-12 (lg)
Icon:    h-4 w-4 (default), h-5 w-5 (medium), h-6 w-6 (large)
```