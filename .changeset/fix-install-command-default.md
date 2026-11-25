---
'@sveltepress/theme-default': patch
---

The home page install command now falls back to `pnpm create @sveltepress`. The previous fallback, `pnpm create sveltepress`, asks npm for a package that does not exist.
