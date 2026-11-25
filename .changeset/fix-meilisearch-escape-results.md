---
'@sveltepress/meilisearch': patch
---

Search results are now escaped before they are rendered. The component asked Meilisearch to wrap matches in `<mark>` and rendered the reply as HTML, so any markup stored in an indexed document reached the page. The component now asks for match markers that cannot be mistaken for markup, escapes the reply, and turns only those markers into `<mark>`. A result whose URL has a scheme other than http(s), such as `javascript:`, no longer navigates. Results from an index whose primary key is not called `id` now render: they all shared one list key before, which Svelte rejects.
