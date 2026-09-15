---
'@sveltepress/vite': patch
---

Fix race condition where terminating the Pagefind service immediately after writing files could leave `pagefind-entry.json` truncated or empty on disk.
