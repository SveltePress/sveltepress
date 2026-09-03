---
'@sveltepress/vite': minor
'@sveltepress/theme-default': minor
---

Support frozen historical documentation version search with Pagefind:
- `@sveltepress/vite`: Add `syncHistoricalPagefind` to generate and persist dedicated Pagefind search assets into immutable version delta storage upon version release; automatically copies existing frozen search assets on subsequent builds without re-indexing.
- `@sveltepress/theme-default`: Enable `LocalSearch` on historical versions, dynamically scoping the Pagefind assets and base path to the active version and locale (e.g. `/v/<id>/pagefind/` or `/<locale>/v/<id>/pagefind/`).
