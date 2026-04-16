---
title: Hello, Sveltepress Blog Theme!
date: 2026-04-01
tags: [svelte, sveltepress, web]
category: Announcements
author: Demo Author
cover: https://picsum.photos/seed/hello/800/400
---

# Hello, Sveltepress Blog Theme!

Welcome to the **Example Blog** powered by `@sveltepress/theme-blog` — a magazine-style Ember palette theme for Sveltepress.

## Features

- 🔥 Masonry card grid with featured post
- 🏷️ Tags and categories
- 📡 RSS feed generation
- ⚡ Zero-config route scaffolding
- 🌙 Ember dark palette

## Getting Started

Install the package and add it to your Vite config:

```ts
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({ title: 'My Blog' }),
      siteConfig: { title: 'My Blog', description: '...' },
    }),
  ],
})
```

That's it — routes are scaffolded automatically on first build.

## Conclusion

The Sveltepress Blog Theme makes spinning up a beautiful content site effortless. Happy writing!
