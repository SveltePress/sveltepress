---
'@sveltepress/theme-default': minor
'@sveltepress/vite': minor
'@sveltepress/docsearch': patch
---

Second design pass: code block system, bounded shell layout, homepage redesign

**Code blocks**

- Dark code surfaces now come from the theme's zinc ramp (`#1f1f23`) instead of the highlighter theme's own background — token colors are kept, so code no longer sits on a clashing navy panel
- Long code blocks (>30 lines by default) start collapsed with a gradient fade and an "Expand code" bar; configurable via `highlighter.codeCollapseLines` (0 disables) and `i18n.expandCode` (`@sveltepress/vite` gains `collapseAfterLines`/`expandLabel` in `WrapCodeBlockOptions`)
- Language label restyled as a subtle uppercase chip; line numbers, diff (emerald/rose) and highlight bands re-tuned to the theme palette; live-code fold bar slimmed with default label "View code"
- Modern monospace fallback stack after the bundled Dank Mono

**Bounded shell layout**

- The docs frame is now capped at 1440px: sidebar column pinned to `min(25vw, 288px)`, TOC to `min(22vw, 256px)`, with panels still painting to the viewport edge — ultrawide screens gain whitespace instead of 480px sidebars
- Navbar inner content bounded to the same shell; the search pill no longer teleports between home and docs pages

**Homepage**

- New default hero visual when no `heroImage` is set: a "+page.md → rendered page" split of two glass panes telling the content-centered story
- The site title is a real `h1`; visible dual-radial rose/amber atmosphere behind the hero; `heroImage` gets a glass panel treatment in dark mode
- Feature cards wrap with a centered last row (no more bottom-right hole for 5 cards)
- One gradient family across the theme: buttons use deep rose → amber (`#e11d48 → #b45309`) with white text

**Foundation & mobile**

- Color hierarchy split: headings zinc-900/zinc-100, body zinc-700/zinc-300; remaining slate/blue-tinted neutrals migrated to zinc in both modes
- `color-scheme` declared for both modes (native scrollbars/controls match the theme)
- Mobile navbar shows the brand mark; DocSearch button borders themed in both modes
- Fixed the DocSearch button disappearing after toggling dark mode: the search widget now mounts once and syncs `data-theme` instead of being torn down and re-initialized on every theme change
- Fixed the DocSearch modal keeping its initial palette after a manual theme switch (docsearch v4's `theme` option pins `data-theme` back on every open — no longer passed)
- Fixed the DocSearch modal rendering underneath the sidebar/navbar: docsearch v4 mounts the modal inline in the navbar container (v3 portaled to `<body>`), trapping it in the header's stacking context — the modal is now lifted to `<body>` when it opens
- Prev/next arrows are clean single chevrons (the old icons also had invalid `strokeWidth` attributes); "Last update at" drops seconds; copy-button class typo fixed (`svp-code-bock--copy-code` → `svp-code-block--copy-code`)
