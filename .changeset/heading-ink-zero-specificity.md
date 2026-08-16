---
'@sveltepress/theme-default': patch
---

Fix utility color classes (e.g. `text-green`) being overridden on headings in dark mode: the heading ink rule expanded to `.dark h1..h6 { color }`, which outranked single-class utilities. Heading ink now uses a zero-specificity `:where()` rule driven by the `--svp-c-heading` variable, so author classes win in both color modes.
