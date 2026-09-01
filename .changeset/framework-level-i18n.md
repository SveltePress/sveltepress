---
'@sveltepress/vite': minor
'@sveltepress/theme-default': minor
'@sveltepress/cli': minor
---

Add opt-in framework-level multi-locale support. `sveltepress({ locales })` declares locales with per-locale theme options and URL prefixes; the core plugin resolves the active locale per route, exposes it through the `virtual:sveltepress/locale` module, generates per-locale `llms.txt`, and emits a combined hreflang sitemap that also lists every eligible historical version route per locale. Version management becomes locale-aware: each locale owns its manifest, version routes compose with the locale prefix, and the CLI's `versions` commands accept a `--locale` selector. The Default Theme renders a language switcher that preserves the current page when a translation exists, resolves navigation and edit links within the active locale, keeps the document language in sync, and localizes its i18n strings per locale. Sites without a `locales` option keep today's exact behavior.
