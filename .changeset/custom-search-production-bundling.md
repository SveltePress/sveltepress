---
'@sveltepress/theme-default': patch
---

Fix custom search components not being bundled into static production builds. A custom `search` source path (for example a `@sveltepress/meilisearch` wrapper) was loaded with a runtime `import(/* @vite-ignore */ path)`, which a static production build never bundles. The theme plugin now resolves the configured source path and serves it through a `virtual:sveltepress/theme-default/custom-search` module whose loader performs a literal dynamic import, so the wrapper ships as a lazy chunk inside the production client. Component-object `search` values remain unsupported because theme options cross the client boundary as JSON; configure a source path instead.
