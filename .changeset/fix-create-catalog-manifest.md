---
'@sveltepress/create': patch
---

Actually fix `npm create @sveltepress@latest` failing with `EUNSUPPORTEDPROTOCOL Unsupported URL Type "catalog:"` (#407).

The previous attempt only rewrote the tarball's `package.json` at pack time, but npm resolves a dependency's tree from the **registry manifest**, which still carried the raw `catalog:` specifiers. The `create` package's runtime `dependencies` now use concrete version ranges instead of `catalog:`, so the published manifest installs correctly with npm and yarn. Also fixes the `files` glob so the `template-js`/`template-ts` folders are actually included in the published tarball.
