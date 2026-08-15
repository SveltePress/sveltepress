---
'@sveltepress/theme-default': patch
---

Tighten sidebar spacing and align its labels

- Sidebar link pills no longer bleed left of the content column — the pill edge now lines up with the group separator, and the label sits 12px inside it instead of hugging the edge
- Group titles share the links' inner padding, so every sidebar label lines up on one vertical edge
- Denser vertical rhythm: 14px labels on a 33px row pitch (was 15px on 38px), with tighter group padding
