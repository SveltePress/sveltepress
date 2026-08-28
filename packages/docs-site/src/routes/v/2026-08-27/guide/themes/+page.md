---
title: Themes
---

## Introduction

Pass `theme` option to sveltepress to use a theme

Read [Vite plugin options](/reference/vite-plugin/) and [Default theme options](/reference/default-theme/) for more details

| Choose | Best for | Content model | Search |
|---|---|---|---|
| Default theme | Documentation, product guides, API references | SvelteKit routes written as Markdown or Svelte | Algolia DocSearch or Meilisearch through a custom wrapper (see the production caveat) |
| Blog theme | Editorial sites and chronological publications | Markdown files in `src/posts` plus generated routes | Built-in Pagefind integration |

## Default theme

### Install

@install-pkg(@sveltepress/theme-default)

### Add in your vite config

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]
import { sveltepress } from '@sveltepress/vite'

import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

Get more info about default theme in [Default theme reference](/reference/default-theme/#Theme-Options)

## Blog theme

The blog theme adds post indexing, pagination, tags, categories, RSS, Open Graph images, related posts, comments, and a Pagefind search UI. It generates a static site and currently requires `@sveltejs/adapter-static` plus a Pagefind post-build step.

Start with the [blog theme guide](/guide/blog-theme/getting-started/) and use the [live demo](https://sveltepress.github.io/sveltepress/blog-demo/) as the runnable reference.
