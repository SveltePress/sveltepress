---
'@sveltepress/theme-blog': minor
---

Add SearchModal component with Pagefind integration. Cmd+K / Ctrl+K (or the new navbar search button) toggles a modal that lazy-loads the Pagefind runtime from /pagefind/pagefind.js, runs debounced searches, and renders top 10 results with highlighted excerpts. Arrow-key navigation, Enter opens the selected result, Esc/backdrop-click dismisses. Focus is trapped inside the dialog and restored to the opener on close, and Pagefind load failures surface as a "Search unavailable" empty state.
