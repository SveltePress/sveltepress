---
'@sveltepress/theme-blog': minor
---

Morph card → post-hero animations via the native View Transitions API. The cover image and title on each post card now share a `view-transition-name` with the corresponding elements on the post page, so SvelteKit navigations animate the clicked card to its detail-page location. Feature-detected and respects `prefers-reduced-motion`.
