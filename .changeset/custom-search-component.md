---
"@sveltepress/docsearch": minor
"@sveltepress/theme-default": minor
---

feat: add @sveltepress/docsearch package and custom search component support

- Extracted docsearch integration into standalone `@sveltepress/docsearch` package
- Added `search` field to `DefaultThemeOptions` for custom search components
- Backward compatible: existing `docsearch` config continues to work
- Closes #373
