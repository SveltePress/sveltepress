---
'@sveltepress/theme-blog': minor
---

Add SearchModal component with Pagefind integration. Cmd+K / Ctrl+K (or the new navbar search button) opens a modal that lazy-loads the Pagefind runtime from /_pagefind/pagefind.js, runs debounced searches, and renders top 10 results with highlighted excerpts. Arrow-key navigation, Enter opens the selected result, Esc/backdrop-click dismisses.
