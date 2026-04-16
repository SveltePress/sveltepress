# Dark/Light Theme Switching — Design Spec

**Date:** 2026-04-16
**Package:** `@sveltepress/theme-blog`
**Status:** Approved

---

## Overview

Add dark/light theme switching to the blog theme. The current theme is exclusively dark ("amber/ember" palette). This feature adds a warm-cream light palette, a toggle button in the Navbar, OS-preference detection, user preference persistence via `localStorage`, and a flash-of-wrong-theme prevention script injected by the Vite plugin.

---

## Decisions

| Question | Decision |
|---|---|
| Light mode palette | Warm cream — extends the amber brand (cream bg, tan surface, dark-brown text) |
| Default mode | Follow OS `prefers-color-scheme`; configurable via `defaultMode` option |
| Toggle placement | Navbar right side, after nav links |
| User preference persistence | `localStorage` key `sp-blog-theme` |
| FOWT prevention | Inline `<script>` injected into `<head>` by Vite plugin's `transformIndexHtml` hook |
| Implementation approach | `data-theme` attribute on `<html>` + CSS custom properties |

---

## 1. CSS Token System

### Mechanism

All theme colors are defined as CSS custom properties on `.sp-blog-root`, controlled by `[data-theme]` on the `<html>` element:

```css
:global([data-theme="dark"]) .sp-blog-root { ... }
:global([data-theme="light"]) .sp-blog-root { ... }
```

### Complete Palette

| Variable | Dark (existing) | Light (new, warm cream) |
|---|---|---|
| `--sp-blog-bg` | `#1a0a00` | `#fef9f0` |
| `--sp-blog-surface` | `#2d1200` | `#fde8c8` |
| `--sp-blog-border` | `#3f1c04` | `#e8d5b0` |
| `--sp-blog-text` | `#fff7ed` | `#1c0a00` |
| `--sp-blog-muted` | `#a16207` | `#92400e` |
| `--sp-blog-content` | `#d6d3d1` | `#44260a` |
| `--sp-blog-primary` | `#fb923c` | `#c2410c` |
| `--sp-blog-secondary` | `#dc2626` | `#dc2626` |

**New variable:** `--sp-blog-content` — body text color in post content. Replaces the scattered hard-coded `#d6d3d1` values in components.

### Hard-coded Color Cleanup

All components are audited and hard-coded hex values replaced with the appropriate CSS variable:

| Component | Hard-coded value | Replacement |
|---|---|---|
| PostCardSmall/Large/Featured | `#fff7ed` (titles) | `--sp-blog-text` |
| PostLayout | `#d6d3d1` (content text) | `--sp-blog-content` |
| Navbar | `#d6d3d1` (links) | `--sp-blog-content` |
| PostCardFeatured | `#fdba74`, `#a8a29e`, `#78350f`, `#1c0a00` | `--sp-blog-primary`, `--sp-blog-muted`, `--sp-blog-text` variants |

### GlobalLayout Changes

- Remove the existing `style={themeStyle}` inline prop (CSS vars are now in the `<style>` block)
- The inline style approach is replaced by `$effect` DOM injection for user-customized colors (see §4)
- `.sp-blog-root` no longer needs an inline `style` attribute for default colors

---

## 2. Anti-FOWT Initialization Script

### Problem

Static prerendered sites render HTML before JS loads. Without intervention, the browser briefly shows the wrong theme before Svelte hydrates.

### Solution

The Vite plugin uses the `transformIndexHtml` hook to inject a synchronous inline `<script>` at the top of `<head>`, before any CSS or body content:

```html
<script>
  (function () {
    var stored = localStorage.getItem('sp-blog-theme');
    var pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = stored || (DEFAULT_MODE === 'system' ? pref : DEFAULT_MODE);
  })();
</script>
```

`DEFAULT_MODE` is replaced at build time by the Vite plugin with the value of `options.defaultMode` (`'system'` | `'dark'` | `'light'`).

### Guarantees

- Executes synchronously before the browser parses any `<body>` content
- Zero layout shift or flash — `data-theme` is set before CSS is applied to any element
- Works with SSR/prerender: the script is in the static HTML, no JS framework required

---

## 3. ThemeToggle Component

**File:** `packages/theme-blog/src/components/ThemeToggle.svelte`

### Responsibilities

- Single responsibility: read and toggle the current theme
- Renders a ☀️ icon button (when dark) or 🌙 icon button (when light)
- On click: flips `document.documentElement.dataset.theme`, writes to `localStorage`
- On mount: reads initial theme from `data-theme` (already set by anti-FOWT script)
- Listens to `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)` — when no localStorage value is set, follows OS changes automatically

### State

```ts
let theme = $state<'dark' | 'light'>('dark')

$effect(() => {
  // Read initial value set by anti-FOWT script
  theme = (document.documentElement.dataset.theme as 'dark' | 'light') ?? 'dark'

  // Listen for OS changes (only when user hasn't overridden)
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onOsChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('sp-blog-theme')) {
      theme = e.matches ? 'dark' : 'light'
      document.documentElement.dataset.theme = theme
    }
  }
  mq.addEventListener('change', onOsChange)
  return () => mq.removeEventListener('change', onOsChange)
})

function toggle() {
  theme = theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
  localStorage.setItem('sp-blog-theme', theme)
}
```

### Styles

- Circular icon button, 36×36px
- Colors via CSS variables: background on hover uses `--sp-blog-surface`, icon color uses `--sp-blog-text`
- Smooth icon crossfade transition (CSS `opacity` + `transform`)

---

## 4. Navbar Integration

### Snippet Pattern

`Navbar.svelte` already accepts a `search` snippet. `ThemeToggle` is passed as a new `toggle` snippet from `GlobalLayout`:

```svelte
<!-- GlobalLayout.svelte -->
<Navbar title={...} links={...} {search}>
  {#snippet toggle()}<ThemeToggle />{/snippet}
</Navbar>
```

`Navbar.svelte` renders: `[logo] [links...] [search?] [toggle]` — toggle is always last on the right.

### Navbar Interface Change

```ts
interface Props {
  title: string
  links: NavLink[]
  search?: Snippet
  toggle?: Snippet   // new
}
```

---

## 5. Type Changes (`types.ts`)

```ts
export interface BlogThemeOptions {
  // ... existing fields ...
  defaultMode?: 'system' | 'dark' | 'light'  // default: 'system'
  themeColorLight?: ThemeColor                // custom light mode colors
}
```

### Custom Color Injection

If `blogConfig.themeColor` (dark) or `blogConfig.themeColorLight` is provided, `GlobalLayout` uses a `$effect` to inject a `<style>` element into `document.head` at runtime:

```ts
$effect(() => {
  const style = document.createElement('style')
  style.id = 'sp-blog-custom-theme'
  style.textContent = buildCustomThemeCSS(blogConfig.themeColor, blogConfig.themeColorLight)
  document.head.appendChild(style)
  return () => style.remove()
})
```

`buildCustomThemeCSS` is a pure helper function that generates CSS like:
```css
[data-theme="dark"] .sp-blog-root { --sp-blog-primary: #custom; ... }
[data-theme="light"] .sp-blog-root { --sp-blog-primary: #custom-light; ... }
```

This avoids `{@html}` in `<svelte:head>` (which caused `svelte2tsx` build failures previously).

---

## 6. Files Changed

| File | Change |
|---|---|
| `src/types.ts` | Add `defaultMode`, `themeColorLight` to `BlogThemeOptions` |
| `src/vite-plugin.ts` | Add `transformIndexHtml` hook to inject anti-FOWT script |
| `src/components/GlobalLayout.svelte` | Replace inline style with `[data-theme]` CSS blocks; add `$effect` for custom colors; pass `ThemeToggle` snippet to Navbar |
| `src/components/Navbar.svelte` | Add `toggle?: Snippet` prop; render toggle slot on right side |
| `src/components/ThemeToggle.svelte` | New component |
| `src/components/PostLayout.svelte` | Replace hard-coded hex with CSS vars |
| `src/components/PostCardSmall.svelte` | Replace hard-coded hex with CSS vars |
| `src/components/PostCardLarge.svelte` | Replace hard-coded hex with CSS vars |
| `src/components/PostCardFeatured.svelte` | Replace hard-coded hex with CSS vars |
| `src/components/PostMeta.svelte` | Replace hard-coded hex with CSS vars |
| `src/components/TableOfContents.svelte` | Replace hard-coded hex with CSS vars |
| `src/components/PostNav.svelte` | Replace hard-coded hex with CSS vars (if any) |
| `src/components/TaxonomyHeader.svelte` | Replace hard-coded hex with CSS vars (if any) |
| `packages/example-blog/` | Rebuild to verify all pages look correct in both modes |

---

## 7. Out of Scope

- Per-page theme overrides
- More than 2 themes (dark/light only)
- Custom theme beyond the 8 CSS variables in `ThemeColor`
- Animation/transition when switching themes (can be added later)
