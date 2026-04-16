---
'@sveltepress/theme-blog': minor
---

Identity features (Phase 1). Adds an author profile config (`author: { name, avatar?, bio?, socials? }`), rendered as an `AuthorCard` at the bottom of every post and a full `AuthorProfile` block on an auto-scaffolded `/about/` page. Posts now carry a `related` array (ranked by shared tags, same category, same year) and a `<RelatedPosts>` grid renders above the author card. `satori` + `@resvg/resvg-js` generate per-post Open Graph images into `static/og/<slug>.png` at build time (site-wide image at `/og/__home.png`), and each page emits og:image / og:title / og:description / JSON-LD BlogPosting meta. A new `<GiscusComments>` component lazy-mounts giscus.app/client.js, reacts to `<html data-theme>` changes, and is opt-in via `blogConfig.giscus`.

Breaking: `BlogThemeOptions.author` changed from `string` to `AuthorProfile` object. Set `author: { name: 'Your Name' }` to restore the previous behaviour.
