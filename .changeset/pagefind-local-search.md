---
'@sveltepress/vite': minor
'@sveltepress/theme-default': minor
---

Add built-in, zero-config Pagefind Local Search:
- `@sveltepress/vite`: Automated post-build static HTML indexing via Pagefind; outputs search bundles into `/pagefind/` with multi-language and CJK support; exports `indexSiteWithPagefind` and provides `pagefind` option in Vite plugin to customize or disable indexing.
- `@sveltepress/theme-default`: Native Svelte 5 `LocalSearch.svelte` modal component with UnoCSS styling, dark/light mode sync, keyboard navigation (`Cmd+K` / `Ctrl+K`, arrows, Enter, Escape), active locale filtering, and dev mode notice; wired as the out-of-the-box default in Navbar with fallback precedence for custom `search` and explicit `docsearch`.
