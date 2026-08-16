---
'@sveltepress/theme-default': patch
---

Fix long code blocks staying clipped inside an expanded "View code" panel: the Expansion slide used a height captured once at mount as a permanent cap, so clicking "Expand code" grew the code but not the panel. The slide now measures on each toggle and releases the cap (`max-height: none`) once the opening animation finishes, so content that grows later stays fully visible.
