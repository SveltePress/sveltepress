---
title: Features
---

Everything on this page is on by default unless noted.

## Sidebar with author identity

The left rail shows the site brand, author avatar + name + bio + socials, optional About HTML block, nav links, search button, and theme toggle. On viewports below 1024 px it collapses to a stacked top bar and hides the verbose bits (bio, socials, about).

The avatar, name, bio, and socials come from `author` in your config. The About block (if any) comes from `about.html`.

## Reading progress bar

A 3 px bar fixed to the top of the viewport fills as the reader scrolls through a post. Rendered only on post pages. No config.

## Masonry home grid

The first post is featured (full-width card with cover or gradient). Remaining posts flow into a 1/2/3-column masonry layout depending on viewport.

Posts with `cover` render as large cards; posts without render as compact cards. The theme picks a tag-hashed gradient for uncovered cards so they still feel distinct.

## Timeline

`/timeline/` groups non-draft posts by month, with year/month labels in a sticky left column and cards on the right connected by a rail. IntersectionObserver animates cards in on scroll.

## Tags & categories

Each tag and category gets its own page built from the same masonry grid. `/tags/` also exposes an index showing every tag with its post count.

Add `navbar` entries like `{ title: 'Tags', to: '/tags/' }` to link them from the sidebar.

## RSS

`rss.xml` is written to `static/rss.xml` on each build. Configure:

```ts
blogTheme({
  base: 'https://example.com',
  rss: {
    enabled: true,      // default
    limit: 20,          // default
    copyright: `© ${new Date().getFullYear()} My Blog`,
  },
})
```

Disable with `rss: { enabled: false }`.

## OG images

Per-post Open Graph images are rendered with Satori + resvg at build time and written to `static/og/<slug>.png`. A site-wide image is written to `static/og/__home.png`.

```ts
blogTheme({
  ogImage: {
    enabled: true,                   // default
    fontPath: '/abs/path/font.ttf',  // defaults to Inter Bold 700
    tagline: 'Subhead under the title',
  },
})
```

Set `enabled: false` to skip generation entirely.

For the OG URLs in meta tags to be fully-qualified (required by Facebook and most crawlers), set `base` to your site's full URL: `base: 'https://example.com'`.

## Search (Pagefind)

`⌘K` / `Ctrl+K` opens the search modal. Pagefind is the indexer; run it as a post-build step:

```bash
pnpm vite build && pnpm pagefind --site dist
```

In dev, the theme serves `/pagefind/` from your last build's `dist/pagefind/` directory, so search works if you've built at least once.

## Comments (Giscus)

Set `giscus` in your config with values from [giscus.app](https://giscus.app/) and `GiscusComments` is rendered below each post. Theme switches (light/dark) are forwarded to the Giscus iframe automatically.

## Syntax highlighting

Code blocks are highlighted with Shiki. Dual themes switch based on `data-theme`. Turn on Twoslash for TypeScript hover info:

```ts
blogTheme({
  highlighter: {
    themeDark: 'night-owl',
    themeLight: 'vitesse-light',
    twoslash: true,
  },
})
```

Code blocks also get a copy button, optional title, line numbers, line highlighting, diff markers, and focus dimming — see the default theme docs for the fence syntax (the same markdown extensions are shared).

## Theme toggle

A sun/moon button in the sidebar cycles `system → dark → light`. An anti-FOWT script is injected into `src/app.html` on first build so the chosen theme is applied before paint.

## Auto-scaffolded routes

Listed in [Getting started](../getting-started/). The scaffolder only writes files that don't already exist, so your customisations are safe across upgrades.
