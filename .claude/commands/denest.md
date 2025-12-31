---
description: Analyze Next.js code for excessive nesting with framework-aware refactoring suggestions
allowed-tools: mcp__context7__*, Task
argument-hint: [ path ]
---

## Step 1: Fetch Documentation

Use context7 to fetch:
- React docs on custom hooks and component composition
- Next.js docs on Server Components, Server Actions, and route handlers

## Step 2: Scan for Nesting Violations

Scan `$ARGUMENTS` (default: entire project) for functions with **4+ levels of nesting**.

## Refactoring Techniques

### Core Patterns (always apply)
- **Extraction**: Pull nested blocks into separate functions
- **Inversion**: Flip conditions, return early, flatten the happy path

### React-Specific
- Extract complex logic into **custom hooks** (`use*`)
- Break large components into **smaller composed components**
- Move conditional rendering logic into dedicated components

### Next.js-Specific
- Separate client interactivity into `'use client'` components
- Extract data mutations into **Server Actions**
- Move complex route logic into utility functions

### Async Patterns
- Flatten Promise chains with `async/await`
- Use early returns for error cases instead of nested `.then()/.catch()`

## Output Format

For each violation:
1. File path and function/component name
2. Current max depth
3. Recommended technique (reference fetched docs)
4. Concrete refactoring suggestion