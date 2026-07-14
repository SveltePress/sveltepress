---
'@sveltepress/vite': patch
---

Fix dev server crashing with `Expected token }` on the newer SvelteKit layout. `sveltepress()` now accepts a `svelteKitOptions` option to forward inline SvelteKit config (`compilerOptions`, `adapter`, ...) — previously the only place for that config was a standalone `sveltekit()` plugin, and keeping both it and `sveltepress()` compiled every Svelte file twice. A clear error is now thrown when a duplicate `sveltekit()` plugin is detected (#408).
