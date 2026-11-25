---
'@sveltepress/theme-default': minor
---

Code blocks can now use any language Shiki bundles. Only the languages in `highlighter.languages` were loaded before, so a `json`, `yaml` or `python` block failed the build with "Language not found" unless it was listed there. Other languages are now loaded the first time a code block uses them, aliases and upper case names such as `py` and `YML` are accepted, and a name Shiki does not know is rendered as plain text with one warning instead of an error. `highlighter.languages` keeps its default and now only decides which languages are loaded up front.
