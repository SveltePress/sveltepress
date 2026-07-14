---
'@sveltepress/create': patch
---

Stop shipping stale `package-lock.json` files in the scaffolding templates. They pinned years-old versions (`@sveltepress/theme-default@5.0.5`, `@sveltepress/vite@1.1.2`, `@sveltejs/vite-plugin-svelte@4`) that no longer match the templates' `package.json`, so `npm install` in a freshly created project failed with `ERESOLVE`. New projects now resolve their dependencies fresh from `package.json`.
