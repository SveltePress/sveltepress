# Dark/Light Theme Switching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dark/light theme switching to `@sveltepress/theme-blog` with OS-preference detection, localStorage persistence, and zero flash-of-wrong-theme.

**Architecture:** A `data-theme` attribute on `<html>` (set by an anti-FOWT inline script injected by the Vite plugin) drives CSS custom property palettes defined in `GlobalLayout.svelte`. A new `ThemeToggle.svelte` component in the Navbar reads/writes this attribute and persists the choice to `localStorage`.

**Tech Stack:** Svelte 5 (`$state`, `$effect`), CSS custom properties, Vite `transformIndexHtml` hook, localStorage.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/theme-blog/src/types.ts` | Modify | Add `defaultMode`, `themeColorLight` to `BlogThemeOptions` |
| `packages/theme-blog/src/vite-plugin.ts` | Modify | Add `transformIndexHtml` to inject anti-FOWT script |
| `packages/theme-blog/src/components/GlobalLayout.svelte` | Modify | Replace inline style with `[data-theme]` CSS blocks; add ThemeToggle; `$effect` for custom color injection |
| `packages/theme-blog/src/components/ThemeToggle.svelte` | Create | New toggle button component |
| `packages/theme-blog/src/components/Navbar.svelte` | Modify | Add `toggle?: Snippet` prop and render it |
| `packages/theme-blog/src/components/PostCardSmall.svelte` | Modify | `#fff7ed` → `var(--sp-blog-text)` |
| `packages/theme-blog/src/components/PostCardLarge.svelte` | Modify | `#fff7ed` → `var(--sp-blog-text)` |
| `packages/theme-blog/src/components/PostMeta.svelte` | Modify | `#d6d3d1` → `var(--sp-blog-content)` |
| `packages/theme-blog/src/components/PostLayout.svelte` | Modify | `#d6d3d1` → `var(--sp-blog-content)`, `#fff7ed` → `var(--sp-blog-text)` |
| `packages/example-blog/` | Verify | Rebuild and browser-verify both themes |

> **Not themed** (always on dark image/gradient overlays — correct behaviour in both modes):
> `PostHero.svelte`, `PostCardFeatured.svelte` — overlay text colors stay hardcoded.

---

## Task 1: Extend Types

**Files:**
- Modify: `packages/theme-blog/src/types.ts`

- [ ] **Step 1: Add `defaultMode` and `themeColorLight` to `BlogThemeOptions`**

Open `packages/theme-blog/src/types.ts`. Replace the `BlogThemeOptions` interface with:

```typescript
export interface BlogThemeOptions {
  title: string
  description?: string
  base?: string
  author?: string
  themeColor?: ThemeColor
  themeColorLight?: ThemeColor              // NEW: custom light mode overrides
  postsDir?: string // default 'src/posts'
  pageSize?: number // default 12
  defaultMode?: 'system' | 'dark' | 'light' // NEW: default 'system'
  rss?: {
    enabled?: boolean
    limit?: number
    copyright?: string
  }
  search?: 'docsearch' | 'meilisearch' | false
  navbar?: Array<{ title: string, to: string }>
}
```

- [ ] **Step 2: Commit**

```bash
cd /path/to/worktree  # packages/theme-blog root
git add packages/theme-blog/src/types.ts
git commit -m "feat(theme-blog): add defaultMode and themeColorLight to BlogThemeOptions"
```

---

## Task 2: Anti-FOWT Script via Vite Plugin

**Files:**
- Modify: `packages/theme-blog/src/vite-plugin.ts`

- [ ] **Step 1: Add `transformIndexHtml` hook to the plugin**

In `packages/theme-blog/src/vite-plugin.ts`, inside the returned plugin object (after the `configureServer` method), add:

```typescript
transformIndexHtml(html) {
  const mode = options.defaultMode ?? 'system'
  const script = `<script>(function(){var s=localStorage.getItem('sp-blog-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=s||(${JSON.stringify(mode)}==='system'?p:${JSON.stringify(mode)});})();<\/script>`
  return html.replace('<head>', `<head>\n  ${script}`)
},
```

The full closing `</script>` is escaped as `<\/script>` to avoid breaking HTML parsers when embedded as a string.

- [ ] **Step 2: Build theme-blog to verify no TypeScript errors**

```bash
cd packages/theme-blog
pnpm build
```

Expected: `src -> dist` with no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/vite-plugin.ts
git commit -m "feat(theme-blog): inject anti-FOWT theme-init script via transformIndexHtml"
```

---

## Task 3: Create ThemeToggle Component

**Files:**
- Create: `packages/theme-blog/src/components/ThemeToggle.svelte`

- [ ] **Step 1: Create the file**

Create `packages/theme-blog/src/components/ThemeToggle.svelte` with this content:

```svelte
<!-- src/components/ThemeToggle.svelte -->
<script lang="ts">
  let theme = $state<'dark' | 'light'>('dark')

  $effect(() => {
    // Read the value set by the anti-FOWT inline script
    const current = document.documentElement.dataset.theme as 'dark' | 'light'
    theme = current ?? 'dark'

    // Follow OS preference changes when the user hasn't manually chosen
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onOsChange(e: MediaQueryListEvent) {
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
</script>

<button
  class="sp-theme-toggle"
  onclick={toggle}
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if theme === 'dark'}
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  {/if}
</button>

<style>
  .sp-theme-toggle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--sp-blog-border);
    background: transparent;
    color: var(--sp-blog-content);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .sp-theme-toggle:hover {
    background: var(--sp-blog-surface);
    color: var(--sp-blog-primary);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/theme-blog/src/components/ThemeToggle.svelte
git commit -m "feat(theme-blog): add ThemeToggle component"
```

---

## Task 4: Update Navbar to Accept Toggle Snippet

**Files:**
- Modify: `packages/theme-blog/src/components/Navbar.svelte`

- [ ] **Step 1: Add `toggle` snippet prop and render it**

Replace the full content of `packages/theme-blog/src/components/Navbar.svelte` with:

```svelte
<!-- src/components/Navbar.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  interface NavLink {
    title: string
    to: string
  }

  interface Props {
    title: string
    links?: NavLink[]
    search?: Snippet
    toggle?: Snippet
  }

  const { title, links = [], search, toggle }: Props = $props()
</script>

<nav class="sp-blog-nav">
  <a href="/" class="sp-blog-nav__logo">{title}</a>
  <div class="sp-blog-nav__links">
    {#each links as link}
      <a href={link.to}>{link.title}</a>
    {/each}
    {@render search?.()}
    {@render toggle?.()}
  </div>
</nav>

<style>
  .sp-blog-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--sp-blog-surface);
    border-bottom: 1px solid var(--sp-blog-border);
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    height: 56px;
    gap: 1rem;
  }
  .sp-blog-nav__logo {
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--sp-blog-primary);
    letter-spacing: -0.02em;
    text-decoration: none;
  }
  .sp-blog-nav__links {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-left: auto;
    font-size: 0.875rem;
  }
  .sp-blog-nav__links a {
    color: var(--sp-blog-content);
    text-decoration: none;
    transition: color 0.15s;
  }
  .sp-blog-nav__links a:hover {
    color: var(--sp-blog-primary);
  }
</style>
```

Note: `#d6d3d1` on nav links is replaced with `var(--sp-blog-content)`.

- [ ] **Step 2: Commit**

```bash
git add packages/theme-blog/src/components/Navbar.svelte
git commit -m "feat(theme-blog): add toggle snippet slot to Navbar"
```

---

## Task 5: Rewrite GlobalLayout — CSS Tokens + ThemeToggle + Custom Colors

**Files:**
- Modify: `packages/theme-blog/src/components/GlobalLayout.svelte`

- [ ] **Step 1: Replace GlobalLayout.svelte entirely**

Replace the full content of `packages/theme-blog/src/components/GlobalLayout.svelte` with:

```svelte
<!-- src/components/GlobalLayout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
  import Navbar from './Navbar.svelte'
  import ThemeToggle from './ThemeToggle.svelte'

  interface Props {
    children?: Snippet
    search?: Snippet
  }

  const { children, search }: Props = $props()

  // Inject user-customised CSS variable overrides at runtime.
  // We use a <style> element (not {@html} in <svelte:head>) to avoid
  // the svelte2tsx build failure that {@html `<style>...</style>`} triggers.
  $effect(() => {
    const dark = blogConfig.themeColor
    const light = blogConfig.themeColorLight
    if (!dark && !light)
      return
    const lines: string[] = []
    if (dark) {
      const vars = Object.entries({
        '--sp-blog-primary': dark.primary,
        '--sp-blog-secondary': dark.secondary,
        '--sp-blog-bg': dark.bg,
        '--sp-blog-surface': dark.surface,
      })
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')
      if (vars)
        lines.push(`[data-theme="dark"] .sp-blog-root{${vars}}`)
    }
    if (light) {
      const vars = Object.entries({
        '--sp-blog-primary': light.primary,
        '--sp-blog-secondary': light.secondary,
        '--sp-blog-bg': light.bg,
        '--sp-blog-surface': light.surface,
      })
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')
      if (vars)
        lines.push(`[data-theme="light"] .sp-blog-root{${vars}}`)
    }
    if (!lines.length)
      return
    const style = document.createElement('style')
    style.id = 'sp-blog-custom-theme'
    style.textContent = lines.join('\n')
    document.head.appendChild(style)
    return () => style.remove()
  })
</script>

<svelte:head>
  <title>{blogConfig.title ?? 'Blog'}</title>
</svelte:head>

<div class="sp-blog-root">
  <Navbar title={blogConfig.title ?? 'Blog'} links={blogConfig.navbar ?? []} {search}>
    {#snippet toggle()}<ThemeToggle />{/snippet}
  </Navbar>
  <main class="sp-blog-main">
    {@render children?.()}
  </main>
</div>

<style>
  /* ── Dark palette (default) ───────────────────────────────── */
  :global([data-theme="dark"]) .sp-blog-root {
    --sp-blog-bg: #1a0a00;
    --sp-blog-surface: #2d1200;
    --sp-blog-border: #3f1c04;
    --sp-blog-text: #fff7ed;
    --sp-blog-muted: #a16207;
    --sp-blog-content: #d6d3d1;
    --sp-blog-primary: #fb923c;
    --sp-blog-secondary: #dc2626;
  }

  /* ── Light palette (warm cream) ──────────────────────────── */
  :global([data-theme="light"]) .sp-blog-root {
    --sp-blog-bg: #fef9f0;
    --sp-blog-surface: #fde8c8;
    --sp-blog-border: #e8d5b0;
    --sp-blog-text: #1c0a00;
    --sp-blog-muted: #92400e;
    --sp-blog-content: #44260a;
    --sp-blog-primary: #c2410c;
    --sp-blog-secondary: #dc2626;
  }

  /* ── Base layout ─────────────────────────────────────────── */
  .sp-blog-root {
    background: var(--sp-blog-bg, #1a0a00);
    color: var(--sp-blog-text, #fff7ed);
    font-family: Inter, system-ui, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
  }

  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background: var(--sp-blog-bg, #1a0a00);
  }

  :global(code),
  :global(pre) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  :global(a) {
    color: var(--sp-blog-primary, #fb923c);
    text-decoration: none;
  }

  :global(a:hover) {
    text-decoration: underline;
  }

  .sp-blog-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
</style>
```

Key changes from the old version:
- Removed `style={themeStyle}` inline style (CSS vars now defined by `[data-theme]` blocks)
- Added two `[data-theme]` palette blocks (dark + light)
- Added `--sp-blog-content` variable (new, for body text)
- Added `ThemeToggle` passed as `toggle` snippet to Navbar
- Added `$effect` for custom color injection

- [ ] **Step 2: Build theme-blog to verify no TypeScript / svelte-package errors**

```bash
cd packages/theme-blog
pnpm build
```

Expected: `src -> dist` with no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/GlobalLayout.svelte
git commit -m "feat(theme-blog): add dual-palette CSS token system and ThemeToggle integration"
```

---

## Task 6: Fix Hard-coded Colors in Card Components

**Files:**
- Modify: `packages/theme-blog/src/components/PostCardSmall.svelte`
- Modify: `packages/theme-blog/src/components/PostCardLarge.svelte`

- [ ] **Step 1: PostCardSmall — replace `#fff7ed` title color**

In `packages/theme-blog/src/components/PostCardSmall.svelte`, in the `<style>` block, change:

```css
/* OLD */
.sp-card-small__title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff7ed;
  margin: 0.3rem 0 0.45rem;
  line-height: 1.35;
}
```

to:

```css
/* NEW */
.sp-card-small__title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--sp-blog-text);
  margin: 0.3rem 0 0.45rem;
  line-height: 1.35;
}
```

- [ ] **Step 2: PostCardLarge — replace `#fff7ed` title color**

In `packages/theme-blog/src/components/PostCardLarge.svelte`, in the `<style>` block, change:

```css
/* OLD */
.sp-card-large__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff7ed;
  margin: 0.35rem 0 0.5rem;
  line-height: 1.3;
}
```

to:

```css
/* NEW */
.sp-card-large__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--sp-blog-text);
  margin: 0.35rem 0 0.5rem;
  line-height: 1.3;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/PostCardSmall.svelte \
        packages/theme-blog/src/components/PostCardLarge.svelte
git commit -m "fix(theme-blog): replace hardcoded card title color with CSS var"
```

---

## Task 7: Fix Hard-coded Colors in PostMeta and PostLayout

**Files:**
- Modify: `packages/theme-blog/src/components/PostMeta.svelte`
- Modify: `packages/theme-blog/src/components/PostLayout.svelte`

- [ ] **Step 1: PostMeta — replace `#d6d3d1` author color**

In `packages/theme-blog/src/components/PostMeta.svelte`, in the `<style>` block, change:

```css
/* OLD */
.sp-post-meta__author {
  font-weight: 600;
  color: #d6d3d1;
}
```

to:

```css
/* NEW */
.sp-post-meta__author {
  font-weight: 600;
  color: var(--sp-blog-content);
}
```

- [ ] **Step 2: PostLayout — replace hardcoded body text colors**

In `packages/theme-blog/src/components/PostLayout.svelte`, in the `<style>` block, change:

```css
/* OLD */
.sp-post-content {
  line-height: 1.75;
  color: #d6d3d1;
}
.sp-post-content :global(h2),
.sp-post-content :global(h3) {
  color: #fff7ed;
  font-weight: 700;
  margin: 2rem 0 0.75rem;
}
```

to:

```css
/* NEW */
.sp-post-content {
  line-height: 1.75;
  color: var(--sp-blog-content);
}
.sp-post-content :global(h2),
.sp-post-content :global(h3) {
  color: var(--sp-blog-text);
  font-weight: 700;
  margin: 2rem 0 0.75rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/PostMeta.svelte \
        packages/theme-blog/src/components/PostLayout.svelte
git commit -m "fix(theme-blog): replace hardcoded body text colors with CSS vars"
```

---

## Task 8: Build Theme-Blog and Example-Blog

**Files:**
- Rebuild `packages/theme-blog`
- Rebuild `packages/example-blog`

- [ ] **Step 1: Final build of theme-blog**

```bash
cd packages/theme-blog
pnpm build
```

Expected: `src -> dist` with no errors.

- [ ] **Step 2: Build example-blog**

```bash
cd packages/example-blog
pnpm build
```

Expected: `Wrote site to "dist"  ✔ done` with no errors.

- [ ] **Step 3: Start preview server**

```bash
cd packages/example-blog
pnpm preview --port 5573
```

Note the actual port if 5573 is taken (check output for `Local: http://localhost:XXXX`).

---

## Task 9: Browser Verification

**Prerequisite:** Preview server from Task 8 is running.

- [ ] **Step 1: Verify dark mode (homepage)**

```bash
agent-browser open http://localhost:5573/
agent-browser get title
agent-browser screenshot
```

Expected:
- Title: "Example Blog"
- Dark amber background visible, orange nav logo, card titles visible

- [ ] **Step 2: Switch to light mode and verify**

```bash
agent-browser find role button --name "Switch to light mode" click
agent-browser screenshot
```

Expected: Page background switches to warm cream (`#fef9f0`), card titles remain readable in dark brown, Navbar retains structure.

- [ ] **Step 3: Verify post page in light mode**

```bash
agent-browser open http://localhost:5573/posts/hello-sveltepress/
agent-browser get title
agent-browser screenshot
```

Expected:
- Title: "Hello, Sveltepress Blog Theme! | Example Blog"
- Light cream background, dark brown body text, orange/rust heading accents

- [ ] **Step 4: Verify toggle persists across navigation**

```bash
# Navigate away and back — localStorage should preserve light mode
agent-browser open http://localhost:5573/tags/svelte/
agent-browser screenshot
```

Expected: Still in light mode (no flash).

- [ ] **Step 5: Switch back to dark mode**

```bash
agent-browser find role button --name "Switch to dark mode" click
agent-browser screenshot
```

Expected: Returns to dark amber palette.

- [ ] **Step 6: Verify tags index page**

```bash
agent-browser open http://localhost:5573/tags/
agent-browser screenshot
```

Expected: Tags page renders correctly in both themes (test in dark after step 5).

- [ ] **Step 7: Commit verification note**

```bash
git add packages/example-blog/  # if any dist files changed
git commit -m "feat(theme-blog): dark/light theme switching — browser verified" --allow-empty
```

---

## Task 10: Final Theme-Blog Build and Cleanup

- [ ] **Step 1: Rebuild theme-blog dist for publication**

```bash
cd packages/theme-blog
pnpm build
```

Expected: `src -> dist` clean.

- [ ] **Step 2: Run full lint check**

```bash
cd /path/to/worktree/root
pnpm lint
```

Fix any issues reported.

- [ ] **Step 3: Final commit if lint required fixes**

```bash
git add -p  # stage only lint fixes
git commit -m "fix(theme-blog): lint fixes after theme switching implementation"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ §1 CSS tokens: Tasks 5, 6, 7 cover all hardcoded color replacements and define both palettes
- ✅ §2 Anti-FOWT: Task 2 injects the script via `transformIndexHtml`
- ✅ §3 ThemeToggle: Task 3 creates the component with `$state`, `$effect`, OS listener, localStorage
- ✅ §4 Navbar integration: Task 4 adds `toggle` snippet
- ✅ §5 Types: Task 1 adds both new fields
- ✅ Custom color injection via `$effect` DOM insertion (no `{@html}` in `<svelte:head>`): Task 5

**PostCardFeatured / PostHero hardcoded colors:** Intentionally left as-is. These components render text on top of dark gradient/photo overlays — they must stay light regardless of theme.

**`--sp-blog-content` variable:** Defined in both palettes (Task 5), consumed in Navbar (Task 4), PostMeta (Task 7), PostLayout (Task 7).

**Type consistency:** `ThemeToggle` has no props. `Navbar` receives `toggle?: Snippet`. `GlobalLayout` uses `blogConfig.themeColor` and `blogConfig.themeColorLight` — both now typed in `BlogThemeOptions` (Task 1). ✅
