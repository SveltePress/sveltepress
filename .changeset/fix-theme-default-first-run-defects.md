---
'@sveltepress/theme-default': patch
---

Fix four defects in the default theme:

- The dark mode toggle did nothing in browsers without the View Transition API and for readers who ask for reduced motion, and it could not be operated from the keyboard. It is now a real button and switches in every case.
- On a first visit the page follows the system colour scheme from the first paint, instead of starting light and turning dark once the page hydrates. The `isDark` store is also correct on load when dark was chosen on an earlier visit.
- `CodeBlock` took its light theme from `highlighter.themeDark` and threw on mount when `highlighter` was not configured. It now uses `highlighter.themeLight` and falls back to the default themes.
- `pwa.precachePages` given as a list of route prefixes produced an empty list of precache patterns in the published package, so the listed pages were not precached. The patterns are generated again.

The dark web manifest set with `pwa.darkManifest` is now emitted as `<link rel="manifest">`. It was a `<meta>` element, which browsers ignore.
