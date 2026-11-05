---
'@sveltepress/theme-blog': minor
---

Add math, code tabs, live code and demo components to blog posts.

- Math: `$…$` and `$$…$$` render with KaTeX. A line that holds only `$$…$$` becomes a centred display block, even right after text.
- Code tabs: a `::::code-tabs` container turns each heading inside it into a tab. Attributes: `active`, `vertical`, `hide-copy`.
- Live code: a ` ```svelte live ` block renders the component above its source. `collapsed` starts with the source hidden; the new `liveCode.sourceLabel` option sets the toggle label.
- Demo components: `.svelte` files in the new `demosDir` option (default `src/demos`) can be used in posts as tags, such as `<Chart title="Sales" />`.
- Code blocks load any language Shiki ships on first use, so `highlighter.languages` is only needed to preload. Language names are case-insensitive.

Fixes:

- Site-absolute URLs in posts use SvelteKit's `paths.base`, so they no longer break on nested pages when `paths.relative` is on.
- Cover images no longer break under a relative base.
- Automatic excerpts skip code blocks and buttons, decode HTML entities and show formulas as TeX.
- The dark theme uses dark scrollbars and form controls; images in posts no longer overflow the column; a short lead paragraph no longer wraps the next block around its drop cap.
