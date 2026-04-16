---
title: SvelteKit Routing Basics
date: 2026-04-10
tags: [sveltekit, routing, svelte]
category: Tutorials
author: Demo Author
cover: https://picsum.photos/seed/routing/800/400
---

# SvelteKit Routing Basics

SvelteKit uses a filesystem-based router. Every `+page.svelte` file becomes a route.

## Dynamic Segments

Use square brackets for dynamic parameters:

```
src/routes/posts/[slug]/+page.svelte
```

Access the param via the `load` function:

```ts
export function load({ params }) {
  return { slug: params.slug }
}
```

## Layout Groups

Group routes without affecting the URL using `(group)` folders. This is useful for applying different layouts to subsets of pages.

## Trailing Slashes

Configure `trailingSlash: 'always'` in a `+layout.ts` to normalize URLs — this avoids duplicate-content issues and makes prerendered static output predictable.
