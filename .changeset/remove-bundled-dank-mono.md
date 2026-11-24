---
'@sveltepress/theme-default': patch
---

Remove the bundled commercial Dank Mono font files and `@font-face` rules from `@sveltepress/theme-default`, falling back to the built-in system monospace font stack (`--svp-code-font`).
