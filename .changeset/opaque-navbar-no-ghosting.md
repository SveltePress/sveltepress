---
'@sveltepress/theme-default': patch
---

Fix ghosted text showing through the navbar while scrolling: the bar was translucent (`rgba(...,0.85)` / `rgba(...,0.8)`) with a backdrop blur, so high-contrast content such as large headings and code bled through as a double image. The bar is now opaque — its colors already matched the page background, so translucency only produced the artifact — and the redundant `backdrop-filter` is gone, which also removes a full-width blur repaint on every scroll frame.
