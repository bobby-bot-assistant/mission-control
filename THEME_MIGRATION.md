# Theme Migration Guide

## Quick Reference

### Before (Hardcoded Dark Mode)
```jsx
className="bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
className="bg-white dark:bg-zinc-900"
className="text-zinc-600 dark:text-zinc-400"
```

### After (Theme System)
```jsx
className="bg-surface text-foreground"
className="bg-background"
className="text-foreground-muted"
```

## Color Mappings

| Old Class | New Class | Description |
|-----------|-----------|-------------|
| `bg-white dark:bg-zinc-900` | `bg-surface` | Card/modal backgrounds |
| `bg-zinc-50 dark:bg-zinc-950` | `bg-background` | Page background |
| `bg-zinc-100 dark:bg-zinc-800` | `bg-secondary` | Secondary buttons |
| `bg-zinc-900 dark:bg-zinc-100` | `bg-primary` | Primary buttons |
| `text-zinc-900 dark:text-zinc-100` | `text-foreground` | Main text |
| `text-zinc-600 dark:text-zinc-400` | `text-foreground-muted` | Muted text |
| `text-zinc-500 dark:text-zinc-500` | `text-foreground-subtle` | Subtle text |
| `border-zinc-200 dark:border-zinc-800` | `border-border` | Borders |

## Migration Steps

1. **Update component classes** using the mapping above
2. **Remove all `dark:` prefixes** - the theme system handles this
3. **Test in both light and dark modes**
4. **Add `theme-transition` class** for smooth theme switching

## Example Component Migration

### Before
```jsx
<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
  <h2 className="text-zinc-900 dark:text-zinc-100 font-bold">Title</h2>
  <p className="text-zinc-600 dark:text-zinc-400">Description</p>
  <button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
    Submit
  </button>
</div>
```

### After
```jsx
<div className="bg-surface border border-border p-6 theme-transition">
  <h2 className="text-foreground font-bold">Title</h2>
  <p className="text-foreground-muted">Description</p>
  <button className="bg-primary text-primary-foreground">
    Submit
  </button>
</div>
```

## Testing Checklist

- [ ] Component looks correct in light mode
- [ ] Component looks correct in dark mode
- [ ] Theme transitions smoothly
- [ ] No hardcoded colors remain
- [ ] Hover states work properly
- [ ] Focus states are visible