---
'@sveltepress/create': patch
---

Fix `npm create @sveltepress@latest` failing with `EUNSUPPORTEDPROTOCOL Unsupported URL Type "catalog:"`. The published package now resolves pnpm `catalog:` specifiers to concrete versions at pack time, so it installs correctly with npm and yarn (#407).
