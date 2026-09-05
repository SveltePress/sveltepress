---
'@sveltepress/theme-default': minor
---

feat(pwa): allow precachePages URL prefixes and cap runtime caches

Default remains homepage-only precache. `precachePages` now also accepts
prefix strings (e.g. current locale / version). The injectManifest SW
runtime-caches visited pages, `__data.json`, and images with expiration
so versioned/i18n sites stay fast to update.
