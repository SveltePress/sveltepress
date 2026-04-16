---
'@sveltepress/theme-blog': minor
---

Support deploying under a subpath. All internal links in the bundled components (`Sidebar`, `Timeline`, `PostMeta`, `RelatedPosts`, `PostCardSmall`, `PostCardLarge`, `PostCardFeatured`, `PostNav`, `SearchModal`) now pass through SvelteKit's `$app/paths` `base`. OG image meta in `GlobalLayout` and `PostLayout` and the JSON-LD `image` field prefer `blogConfig.base` (fully-qualified URL) when set so crawlers get absolute URLs. The scaffolded tags index also uses `base`.

If you had customised `src/routes/tags/+page.svelte`, import `{ base }` from `$app/paths` and change `href="/tags/{name}/"` to `href="{base}/tags/{name}/"`. Other scaffolded files were already base-correct.
