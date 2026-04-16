---
title: Customisation
---

## Colour palette

Override the dark or light palette via `themeColor` / `themeColorLight`:

```ts
blogTheme({
  themeColor: {
    primary: '#fb923c',
    secondary: '#dc2626',
    bg: '#1a0a00',
    surface: '#2d1200',
  },
  themeColorLight: {
    primary: '#c2410c',
    bg: '#fef9f0',
    surface: '#fde8c8',
  },
})
```

Any key you omit keeps the theme default. At runtime these are injected as CSS custom properties scoped to `[data-theme="dark"] .sp-blog-root` and `[data-theme="light"] .sp-blog-root`.

## CSS custom properties

All components read these variables. Override them in your own styles for fine-grained control:

| Variable | Purpose |
|---|---|
| `--sp-blog-bg` | Page background |
| `--sp-blog-surface` | Card/sidebar background |
| `--sp-blog-border` | Separators, card borders |
| `--sp-blog-text` | Primary text (titles) |
| `--sp-blog-content` | Body text |
| `--sp-blog-muted` | Meta text (dates, counts) |
| `--sp-blog-primary` | Accent (links, tags, buttons) |
| `--sp-blog-secondary` | Secondary accent |

## Swapping components

The scaffolded files under `src/routes/` import components from `@sveltepress/theme-blog/components/*`. To replace one — say the post cards — edit `src/routes/+page.svelte` and substitute your own component:

```svelte title="src/routes/+page.svelte"
<script lang="ts">
  import MyGrid from '$lib/MyGrid.svelte'
  const { data } = $props()
</script>

<MyGrid posts={data.posts} />
```

The theme re-exports these building blocks:

- `@sveltepress/theme-blog/PostLayout.svelte`
- `@sveltepress/theme-blog/components/MasonryGrid.svelte`
- `@sveltepress/theme-blog/components/Timeline.svelte`
- `@sveltepress/theme-blog/components/Pagination.svelte`
- `@sveltepress/theme-blog/components/Sidebar.svelte`
- `@sveltepress/theme-blog/components/SearchModal.svelte`
- `@sveltepress/theme-blog/components/ReadingProgress.svelte`
- `@sveltepress/theme-blog/components/GiscusComments.svelte`
- `@sveltepress/theme-blog/components/RelatedPosts.svelte`
- `@sveltepress/theme-blog/components/TaxonomyHeader.svelte`

## Deploying under a subpath

Read `BASE_PATH` in `svelte.config.js` and `SITE_URL` in `vite.config.ts`:

```js title="svelte.config.js"
paths: {
  base: process.env.BASE_PATH ?? '',
  relative: false,
},
```

```ts title="vite.config.ts"
blogTheme({
  base: process.env.SITE_URL ?? 'http://localhost:4173',
  // ...
})
```

Then build with both set, e.g. for GitHub Pages project site at `user.github.io/repo/blog`:

```bash
BASE_PATH=/repo/blog SITE_URL=https://user.github.io/repo/blog \
  pnpm vite build && pnpm pagefind --site dist
```

All internal links in the theme components use SvelteKit's `$app/paths` `base`, so they resolve correctly under the subpath. OG image URLs and RSS item URLs use `SITE_URL` so social crawlers get fully-qualified URLs.

## Adding pages

Anything under `src/routes/` that isn't reserved by the scaffolder is yours. Wrap custom pages in `GlobalLayout` automatically by leaving `src/routes/+layout.svelte` untouched — every route renders inside the sidebar + main grid.
