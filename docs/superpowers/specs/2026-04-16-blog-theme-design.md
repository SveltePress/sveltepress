# Blog Theme Design Spec

**Date:** 2026-04-16  
**Package:** `@sveltepress/theme-blog`  
**Status:** Approved

---

## Overview

A standalone blog theme for Sveltepress. Ships as an independent npm package (`packages/theme-blog/`) that users opt into separately from `theme-default`. The theme provides a magazine-style visual design with an Ember color palette (dark warm tones, orange-red accents), masonry card grid layout, and zero-config post management via a Vite plugin.

---

## User-Facing API

### Installation & Configuration

```js
// vite.config.ts
import { sveltepress } from '@sveltepress/vite'
import { blogTheme } from '@sveltepress/theme-blog'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        title: 'My Blog',
        description: 'Tech sharing',
        author: 'Author Name',               // global author
        themeColor: { primary: '#fb923c' }, // optional, defaults to Ember palette
        rss: { enabled: true },
      }),
    }),
  ],
})
```

### Full Configuration API

```ts
interface BlogThemeOptions {
  // Site info
  title: string
  description?: string
  base?: string          // deployment sub-path, default '/'
  author?: string        // global author, overridable per post

  // Theme colors (default: Ember palette)
  themeColor?: {
    primary?: string     // default '#fb923c'
    secondary?: string   // default '#dc2626'
    bg?: string          // default '#1a0a00'
    surface?: string     // default '#2d1200'
  }

  // Posts
  postsDir?: string      // default 'src/posts'
  pageSize?: number      // posts per page on list view, default 12

  // RSS
  rss?: {
    enabled?: boolean    // default true
    limit?: number       // default 20
    copyright?: string
  }

  // Search (reuses theme-default interface)
  search?: 'docsearch' | 'meilisearch' | false

  // Navbar links
  navbar?: Array<{
    title: string
    to: string
  }>
}
```

---

## Post Authoring

Posts are `.md` files placed in `src/posts/` (configurable). The filename becomes the slug.

### Frontmatter Schema

```yaml
---
title: 'Post Title'          # required
date: 2026-04-10             # required, ISO date
cover: /images/cover.jpg     # optional, image URL
tags: [Architecture, Tools]  # optional
category: Engineering        # optional, single value
excerpt: 'Custom summary...' # optional, auto-extracted (first 120 chars) if omitted
author: Dongsheng            # optional, falls back to global config
draft: true                  # optional, drafts are excluded from build
---
```

---

## Routing

All routes are injected automatically by the Vite plugin. Users do not create these manually.

| Route | Page |
|-------|------|
| `/` | Post list (masonry card grid, paginated) |
| `/posts/[slug]` | Post detail |
| `/tags/[tag]` | Posts filtered by tag |
| `/categories/[cat]` | Posts filtered by category |
| `/rss.xml` | RSS feed (generated at build time) |

---

## Architecture

### Vite Plugin

The plugin (`packages/theme-blog/src/vite-plugin.ts`) is responsible for:

1. **Scanning** `src/posts/` for `.md` files at startup and on file changes
2. **Parsing** frontmatter from each file (using `gray-matter`)
3. **Computing** `readingTime` (words / 200, rounded up)
4. **Auto-extracting** excerpt from body text when not specified in frontmatter
5. **Exposing** three virtual modules (see below)
6. **Generating** `static/rss.xml` in the `generateBundle` Vite hook
7. **Invalidating** virtual modules on HMR when files in `src/posts/` change

### Virtual Modules

```ts
// virtual:sveltepress/blog-posts
export const posts: BlogPost[]   // sorted by date descending, drafts excluded

// virtual:sveltepress/blog-tags
export const tags: Record<string, BlogPost[]>

// virtual:sveltepress/blog-categories
export const categories: Record<string, BlogPost[]>
```

### BlogPost Type

```ts
interface BlogPost {
  slug: string        // filename without extension
  title: string
  date: string        // ISO string
  cover?: string
  tags: string[]
  category?: string
  excerpt: string
  author?: string
  readingTime: number // minutes, auto-computed
}
```

---

## Component Architecture

### Layout Hierarchy

```
GlobalLayout.svelte
├── PageLayout.svelte       (list / tag / category pages)
└── PostLayout.svelte       (post detail pages)
```

### GlobalLayout Responsibilities

- Navbar: Logo + nav links + global search widget (interface-compatible with theme-default)
- CSS variable injection from `themeColor` config (`--sp-blog-primary`, `--sp-blog-bg`, etc.)
- Font loading: Inter (body) + JetBrains Mono (code)
- Dark Ember base palette applied globally

### Post List Page Component Tree

```
PageLayout
└── MasonryGrid                  (CSS columns, no JS dependency)
    ├── PostCardFeatured         (pinned post, full-width banner)
    ├── PostCardLarge            (has cover image, taller)
    └── PostCardSmall            (no cover, text-only + left accent bar)
```

Card details:
- Cover image or gradient fallback (tag name hashed to one of the Ember palette gradients)
- Tag badges, category, date, reading time
- CSS `transform: translateY` hover lift + cover darkening (no JS)

### Post Detail Page Component Tree

```
PostLayout
├── PostHero                     (large title + blurred cover background)
├── TableOfContents              (floating right sidebar, scroll-highlighted)
├── PostContent                  (markdown render area with code highlighting)
├── PostMeta                     (author / date / reading time / tags)
└── PostNav                      (previous / next post links)
```

### Tag & Category Pages

Reuse `PageLayout` + `MasonryGrid`. A `TaxonomyHeader` component is prepended showing the current tag/category name and post count.

---

## RSS Generation

- Triggered by Vite's `generateBundle` hook (build-time only)
- Output: `static/rss.xml` (SvelteKit copies `static/` to build output automatically)
- Format: RSS 2.0
- Default: latest 20 posts (configurable via `rss.limit`)
- Each `<item>` includes: title, link, pubDate, description (excerpt), category

---

## Package Structure

```
packages/theme-blog/
├── src/
│   ├── index.ts                  # package entry, exports blogTheme()
│   ├── types.ts                  # BlogThemeOptions, BlogPost interfaces
│   ├── vite-plugin.ts            # core Vite plugin (scan, virtual modules, RSS)
│   ├── rss.ts                    # RSS XML generator
│   ├── reading-time.ts           # word count → minutes utility
│   └── components/
│       ├── GlobalLayout.svelte
│       ├── PageLayout.svelte
│       ├── PostLayout.svelte
│       ├── Navbar.svelte
│       ├── MasonryGrid.svelte
│       ├── PostCardLarge.svelte
│       ├── PostCardSmall.svelte
│       ├── PostCardFeatured.svelte
│       ├── PostHero.svelte
│       ├── TableOfContents.svelte
│       ├── PostMeta.svelte
│       ├── PostNav.svelte
│       └── TaxonomyHeader.svelte
├── package.json
├── build.config.ts
└── tsconfig.json
```

---

## Out of Scope

The following are explicitly excluded from this implementation:

- Comments system
- Multi-author permissions
- Paid subscription / gating
- Internationalization (i18n)
- Light mode toggle (Ember is dark-only)

---

## Testing

- Unit tests in `packages/theme-blog/__tests__/`
- Cover: virtual module output correctness, frontmatter parsing edge cases, reading time calculation, RSS XML structure
- No automated component tests (consistent with `theme-default` approach)
