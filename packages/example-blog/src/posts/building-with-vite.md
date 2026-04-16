---
title: Building Fast Sites with Vite
date: 2026-02-14
tags: [vite, tooling, performance]
category: Tutorials
author: Demo Author
cover: https://picsum.photos/seed/vite/800/400
---

# Building Fast Sites with Vite

Vite is a modern build tool designed for speed. With its native ES module support and lightning-fast HMR, development becomes a pleasure.

## Why Vite?

- **Instant cold starts** — no bundling during dev
- **Hot Module Replacement** — updates in milliseconds
- **Rollup-based production builds** — optimized output
- **Plugin ecosystem** — extend with ease

## Basic Config

```ts
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
})
```

## Virtual Modules

Vite supports virtual modules — a powerful pattern for generating code at build time:

```ts
export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id) {
      if (id === 'virtual:my-data')
        return '\0virtual:my-data'
    },
    load(id) {
      if (id === '\0virtual:my-data') {
        return `export const data = ${JSON.stringify({ hello: 'world' })}`
      }
    },
  }
}
```

## Conclusion

Vite's fast feedback loop and powerful plugin API make it an excellent choice for modern web projects.
