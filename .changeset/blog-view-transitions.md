---
'@sveltepress/theme-blog': minor
---

Morph card ↔ post-hero animations via the native View Transitions API. The cover, title, first tag, date, reading-time, and excerpt on each post card now share a `view-transition-name` with the corresponding elements on the post page, so SvelteKit navigations animate the clicked card to its detail-page location — and animate back when the user returns to the listing. `PostHero` gains a small deck/subtitle that echoes `post.excerpt` so the card excerpt has a matching morph target. Feature-detected and respects `prefers-reduced-motion`.

The cover `view-transition-name` lives on an always-sized wrapper div (rather than the `<img>` itself), so back-navigation still morphs even when the freshly-remounted image has not yet produced a layout box at capture time.

On back-navigation, `GlobalLayout` temporarily toggles `html.sp-vt-active` around each cross-document transition and a global CSS rule flips `.sp-card-large` / `.sp-card-small` out of `content-visibility: auto` for the duration. Without this, off-viewport cards were still skipped when the browser captured the "new" snapshot — their shared `view-transition-name` elements were missing from the capture, and the reverse morph degraded to a root crossfade. The class is cleared on `transition.finished`, so the lazy-render behavior resumes immediately after the animation.
