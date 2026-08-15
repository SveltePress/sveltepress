---
'@sveltepress/theme-default': minor
---

Unify brand colors and polish visual details

- Docsearch accents now match the rose brand instead of the blue defaults (the runtime-injected stylesheet was overriding the theme), and the dark search modal uses the zinc palette
- Hero title gradient uses dark-aware endpoints so it stays legible on light backgrounds
- Navbar active items get an underline indicator (skipped for the brand logo)
- Home hero gets a subtle radial glow for depth in both color modes
- Feature cards no longer fall back to random fruit icons when no icon is provided
