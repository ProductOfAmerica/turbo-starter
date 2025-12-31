---
description: Audit app/ directory for Next.js rendering and caching issues
allowed-tools: mcp__context7__*
argument-hint: [ path ]
---

## Step 1: Fetch Next.js Documentation

Use context7 to fetch the latest Next.js documentation on:

- Cache Components
- Partial Prerendering (PPR)
- Static vs dynamic rendering
- Data fetching patterns (fetch, unstable_cache, revalidate)

## Step 2: Audit the Codebase

Scan `$ARGUMENTS` (default: `app/`) for violations. Reference the fetched docs when flagging issues.

## Output Format

Group findings by file:

```
### path/to/file.tsx
- 🔴 Critical: [issue] — [doc reference]
- 🟡 Warning: [issue] — [doc reference]  
- 🔵 Info: [suggestion] — [doc reference]
```

Severity levels:

- 🔴 **Critical**: Will cause incorrect behavior or performance problems
- 🟡 **Warning**: Suboptimal patterns, potential issues
- 🔵 **Info**: Suggestions for improvement