---
'@sveltepress/theme-blog': patch
---

Serve the Pagefind index from `dist/pagefind/` during `vite dev` so the SearchModal works locally. Pagefind is a post-build step, so there's no live index in dev — the plugin now reuses the most recently built one. Run `pnpm build` once to populate the index.
