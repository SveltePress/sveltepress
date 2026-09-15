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

Start with the [blog theme guide](/guide/blog-theme/getting-started/). The [live demo](https://sveltepress.github.io/sveltepress/blog-demo/) is the finished showcase; the [Playground Blog theme Entries](/playground/) auto-boot the Blog starter.

## Custom theme

There is no Guide leaf for Custom theme. Open it from [Playground home](/playground/) — the Feature directory Entry auto-boots a newly authored Custom theme starter (no Default Theme, no Blog theme) at `src/routes/+layout.svelte` and `src/routes/+page.md`. Chinese and Bengali embed `custom-theme-zh` / `custom-theme-bn`, written in that language at the same default paths — not extra `/zh/` or `/bn/` routes.

The Playground [Kitchen sink](/playground/kitchen-sink/) Entry is the largest Default Theme project that can coexist (Markdown, Default Theme, i18n, versions, Vite plugin, and virtual modules). Blog theme and custom theme never live in that tree.
