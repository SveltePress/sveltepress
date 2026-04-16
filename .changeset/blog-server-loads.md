---
'@sveltepress/theme-blog': minor
---

Move all route loads to `+page.server.ts` so post data is baked into prerendered `data.json` instead of shipped in client bundles. Adds `/page/[n]/` paginated list routes. Existing projects using theme-blog will have legacy `+page.ts` and outdated `.svelte` route files auto-removed on next dev-server start; the scaffolder writes the new server-load variants in their place.
