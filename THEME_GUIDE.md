# Theme Guide — Mission Control

## How It Works

CSS variables in `styles/theme.css` define colors for light (`:root`) and dark (`.dark`) modes. Tailwind maps these to semantic class names in `tailwind.config.js`. **You never need `dark:` prefixes** — the CSS variables handle the switch automatically.

## Tailwind Classes to Use

| Purpose | Class | Light | Dark |
|---------|-------|-------|------|
| Page background | `bg-background` | zinc-50 | zinc-950 |
| Subtle background | `bg-background-subtle` | zinc-100 | zinc-900 |
| Card/panel | `bg-surface` | white | zinc-900 |
| Hover state | `bg-surface-hover` | zinc-50 | zinc-800 |
| Primary text | `text-foreground` | zinc-900 | near-white |
| Secondary text | `text-foreground-muted` | zinc-700 | zinc-300 |
| Tertiary text | `text-foreground-subtle` | zinc-600 | zinc-400 |
| Border | `border-border` | zinc-300 | zinc-700 |
| Subtle border | `border-border-subtle` | zinc-200 | zinc-800 |
| Accent bg | `bg-secondary` | zinc-100 | zinc-800 |
| Semantic | `text-success` / `text-error` / `text-warning` / `text-info` | auto | auto |

## ❌ BANNED Classes

Never use these — they break light/dark mode:

```
dark:bg-zinc-*    dark:text-zinc-*    dark:border-zinc-*
bg-zinc-900       bg-zinc-800         bg-zinc-950
text-zinc-100     text-zinc-300       text-zinc-400
border-zinc-800   border-zinc-700
```

## ✅ Correct vs ❌ Incorrect

```tsx
// ❌ WRONG — hardcoded, breaks in light mode
<div className="bg-zinc-900 text-zinc-100 border-zinc-800">
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">

// ✅ RIGHT — uses theme system
<div className="bg-surface text-foreground border-border">
```

## Exceptions

- `prose-zinc` (Tailwind Typography plugin) — OK
- Colored semantic classes (`bg-red-500`, `text-blue-400`, `bg-green-900/30`) — OK, these are intentional accent colors

## Lint

Run `bash scripts/lint-theme.sh` to check for violations.
