---
"@sveltepress/theme-blog": patch
---

Fix blog theme startup in StackBlitz WebContainers and other environments that disable native addons. Probe whether native addons can load before importing the Open Graph renderer, load it only when generation is enabled, and warn and skip PNG generation if it cannot be loaded, preserving existing images and the rest of the blog. Native Node.js environments continue to generate OG images normally.
