---
'@sveltepress/theme-default': minor
---

Optimize PWA service worker precaching performance by decoupling document pages from the precache manifest and adopting runtime caching with NetworkFirst and PrecacheFallbackPlugin, substantially speeding up build-time hashing and client-side update comparisons for sites with many pages. Users can still opt in to full-page precaching via `precachePages: true`.
