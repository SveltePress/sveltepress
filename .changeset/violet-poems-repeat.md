---
'@sveltepress/theme-default': minor
---

Design refresh for the default theme

- Navbar now has a real translucent surface (light & dark) with a hairline bottom border and stronger backdrop blur — content no longer ghosts behind it while scrolling
- New accessible admonition palette with separate light/dark pairs (the old flat-UI colors failed contrast badly — e.g. the yellow NOTE label was ~1.6:1); `note` is now neutral slate, `warning` is amber with a triangle icon (the skull stays on `danger`), border slimmed to 4px with an 8px radius
- Dark mode surfaces unified on one neutral zinc ramp (body `#18181b`, sidebar `#161618`, cards/dropdowns `#202023`) instead of mixed blue-tinted/pure-black grays
- Content column capped at 780px and paragraph line-height raised to 1.75 for a readable measure on wide screens; explicit heading scale (h2 24px, h3 20px, h4 18px) with tuned spacing rhythm
- Prose links are underlined with a 500 weight; navbar/sidebar active states use solid brand color instead of low-contrast gradient text at small sizes
- New `themeColor.primaryDeep` option (default `#e11d48`): a deeper accent used for rose *text* in light mode (links, TOC/sidebar/nav active states, edit link, prev/next titles) so accent text meets AA contrast, while dark mode keeps the lighter primary
- Primary hero button uses dark text on the gradient (white-on-yellow was unreadable); secondary buttons and feature cards get hairline borders and refined hover states
- Gradient *text* (hero wordmark) defaults to a deeper gold tail (`#f59e0b`) so it stays legible on light backgrounds; custom `themeColor.gradient` values are respected unchanged
- Code blocks get hairline borders, a legible language label, a visible-on-touch copy button, thin scrollbars; inline code no longer breaks mid-token and is sized at 0.875em
- Blockquotes, tables (header rule + row hover), sidebar (hover/active pills, right border), TOC (colored active item) and mobile nav polished; global `:focus-visible` ring added
