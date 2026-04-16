---
'@sveltepress/theme-blog': patch
---

Polish SearchModal interactions. Result items now respond to the pointer — hover highlights the row and syncs keyboard selection, so mouse and arrow-key navigation no longer fight. Clicking a result (or pressing Enter) dismisses the modal instead of leaving it stuck open after navigation. The result list's scrollbar now uses the theme's border/primary tokens, replacing the default OS colors that clashed with the warm palette.
