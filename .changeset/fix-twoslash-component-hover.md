---
'@sveltepress/twoslash': patch
'@sveltepress/theme-default': patch
---

Fix twoslash hover popups for Svelte component attributes. Previously, hovering over component props like `placement` showed incorrect internal types (e.g., `ComponentConstructorOptions.target`) or no hover at all. Now component attributes correctly display their prop types.
