---
title: Auditing JavaScript Bundle Size
date: 2026-03-22
tags: [performance, web, tooling]
category: Performance
author: Demo Author
cover: https://picsum.photos/seed/bundle/800/400
---

# Auditing JavaScript Bundle Size

Bundle bloat creeps in one `npm install` at a time. A quarterly audit keeps your app fast.

## Visualize First

`rollup-plugin-visualizer` or `vite-bundle-visualizer` gives you a treemap of your production bundle. Look for:

- Duplicate copies of the same dependency at different versions
- Massive "utility" libraries imported for a single function
- Locale data shipped when you only use English
- Source maps accidentally included in the output

## The Lodash Trap

```ts
// Bad — imports all of lodash (~70kb)
import _ from 'lodash'

// Good — imports just one function (~2kb)
import debounce from 'lodash/debounce'

// Better — drop lodash entirely
function debounce(fn, ms) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
```

## Measure the Right Thing

Gzipped transfer size is what users pay for, not minified size. A 500kb minified bundle is often 120kb on the wire.
