---
title: Getting started
---

:::tip[See it live first]{icon=noto:rocket}
Before you scaffold anything, **take a look at the live demo — [sveltepress.github.io/sveltepress/blog-demo](https://sveltepress.github.io/sveltepress/blog-demo/)**. Everything described on this page is already working there.

Source: [`packages/example-blog`](https://github.com/SveltePress/sveltepress/tree/main/packages/example-blog) in the monorepo. Clone it, `pnpm install && pnpm dev`, and you have a runnable reference on `localhost:4173`.
:::

`@sveltepress/theme-blog` is a magazine-style blog theme with a left-rail sidebar, masonry post grid, per-post OG images, RSS, Pagefind search, and Giscus comments. This page walks you through scaffolding a working blog.

## Install

@install-pkg(@sveltepress/theme-blog)

The theme requires `@sveltejs/adapter-static` because it generates a fully static site (prerendered HTML, JSON, RSS, OG images).

@install-pkg(@sveltejs/adapter-static)

## Configure Vite

```ts title="vite.config.ts"
// @noErrors
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        title: 'My Blog',
        description: 'Thoughts on Svelte and the web.',
        base: 'https://example.com',
        author: {
          name: 'Your Name',
          avatar: '/avatar.png',
          bio: 'Short bio shown in the sidebar.',
          socials: {
            github: 'your-handle',
            twitter: 'your-handle',
            rss: '/rss.xml',
          },
        },
        navbar: [
          { title: 'Home', to: '/' },
          { title: 'Timeline', to: '/timeline/' },
          { title: 'Tags', to: '/tags/' },
        ],
      }),
    }),
  ],
})
```

## Configure SvelteKit

```js title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  extensions: ['.svelte'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      fallback: '404.html',
    }),
    prerender: {
      handleMissingId: 'ignore',
      handleUnseenRoutes: 'ignore',
    },
    paths: {
      base: process.env.BASE_PATH ?? '',
      relative: false,
    },
  },
  compilerOptions: {
    runes: true,
  },
}
```

`BASE_PATH` lets you deploy under a subpath (e.g. GitHub Pages project site). Leave the env var unset for root deployments.

## Write your first post

Create `src/posts/hello-world.md`:

```md title="src/posts/hello-world.md"
---
title: Hello world
date: 2026-04-17
tags: [intro]
category: meta
excerpt: First post on the new blog.
---

# Hello

Welcome to my blog. Everything is markdown.
```

## Routes auto-scaffolded

On the next `vite dev` or `vite build`, the theme writes these files if they don't exist. Edit them freely — the scaffolder only creates missing files.

| Path | Purpose |
|---|---|
| `src/routes/+layout.ts` | Enables prerender + `trailingSlash: 'always'` |
| `src/routes/+layout.svelte` | Wraps pages in `GlobalLayout` |
| `src/routes/+page.{server.ts,svelte}` | Paginated home |
| `src/routes/page/[n]/...` | Page 2+ of the list |
| `src/routes/posts/[slug]/...` | Individual post pages |
| `src/routes/tags/+page.svelte` | Tag index |
| `src/routes/tags/[tag]/...` | Posts for a tag |
| `src/routes/categories/[cat]/...` | Posts for a category |
| `src/routes/timeline/+page.svelte` | Archive timeline |

## Build

```bash
pnpm vite build && pnpm pagefind --site dist
```

The Pagefind step indexes the built site so the search modal (`⌘K` / `Ctrl+K`) works. Skip it if you don't use search.

The resulting `dist/` is a static bundle deployable to any static host.
