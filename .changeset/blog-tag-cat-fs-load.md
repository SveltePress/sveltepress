---
'@sveltepress/theme-blog': patch
---

Tag and category server loads now read post lists from disk instead of dynamic-importing a `virtual:` module — the previous approach broke SvelteKit's prerender (Node's ESM loader rejects `virtual:` URL schemes). Existing broken scaffolds get regenerated automatically.
