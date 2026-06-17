---
'@sveltepress/vite': patch
---

Normalize SvelteKit preload dependency paths in static builds to avoid nested `/_app/immutable` requests during hydration.
