---
'@sveltepress/theme-blog': patch
---

Prefix site-absolute image sources and links in Markdown post bodies with SvelteKit's configured base path, and include that base in the post parse cache identity so root and subpath builds cannot reuse incompatible HTML.
