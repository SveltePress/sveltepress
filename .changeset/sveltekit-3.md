---
'@sveltepress/vite': minor
'@sveltepress/theme-default': minor
'@sveltepress/theme-blog': minor
'@sveltepress/create': minor
'@sveltepress/cli': patch
---

Support SvelteKit 3 alongside SvelteKit 2 (`2.65.1`+).

- On SvelteKit 3, which no longer reads `svelte.config.js`, `sveltepress()` always forwards `svelteKitOptions` with the `.md` extension, and explains how to move a leftover `svelte.config.js` into `svelteKitOptions`.
- The themes no longer use `base` from `$app/paths` (removed in SvelteKit 3) or `$app/environment` (deprecated).
- Pagefind indexing runs after the SvelteKit 3 adapter has written the site.
- SvelteKit 3 builds no longer warn `SOURCEMAP_BROKEN` for every page or `transform_index_html_unsupported` for UnoCSS.
- Version management tracks `#lib/` imports like `$lib/` ones.
- The blog theme replaces an unmodified tags index scaffolded by an earlier version, which imported `base` from `$app/paths`.
- New projects created with `@sveltepress/create` use SvelteKit 3, with the SvelteKit config in `svelteKitOptions`.
- The Default Theme `pwa` option warns on SvelteKit 3, because `@vite-pwa/sveltekit` does not support it yet.
