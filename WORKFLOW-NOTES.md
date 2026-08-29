# Workflow notes

## README site screenshot

- The root README embeds `assets/site.png` at 600 CSS pixels wide.
- The source is the Sveltepress home page. Production is `https://sveltepress.site/`; a local preview URL can be used before deployment.
- The artifact is a `2048 × 1102` RGBA PNG composed from fixed desktop and mobile viewports.
- Both viewports intentionally show a theme transition paused midway. The light region is a circular reveal over the dark render.
- Desktop capture: `1752 × 890`; light-circle center `(1561.054, 34.788)`, radius `910.572`.
- Mobile capture: `548 × 979`; placed at `(1500, 123)`; light-circle center `(472.905, 50.276)`, radius `587.413` in mobile coordinates.
- Capture light and dark states in fresh browser contexts by setting `SVELTEPRESS_DARK_MODE` before the page loads. Clicking the theme control introduces focus outlines and is not stable.
- Do not wait for network idle. The production site may keep background requests open. Wait for DOM content, the hero selector, fonts, and visible images instead.
- Hide scrollbars and disable CSS animations before capture so browser UI and timing do not change the artifact.
- Advance every SVG animation timeline to 3 seconds and pause it. The site's finite icon transitions finish by 2.7 seconds; fixing the timeline also prevents the repeating sun/moon animation from changing pixels between runs.
- Write a temporary image, validate its PNG header and dimensions, then rename it over the target. A failed run must leave the previous README image untouched.
- The automated checks do not replace visual review. Inspect the final composite before committing it.
