---
'@sveltepress/theme-default': patch
---

Skip frozen and dev-mounted historical version snapshot trees when generating the auto sidebar so `/v/` (and locale-composed bases) do not appear as live sidebar groups.
