---
'@sveltepress/example-blog': patch
---

Integrate Pagefind post-build indexing: `pnpm build` now runs `pagefind --site dist` after `vite build`. Generates a static search index (~45 pages) that the upcoming SearchModal will consume via `/pagefind/pagefind.js`.
