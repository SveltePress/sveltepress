<h1 align="center">
  <br>
 <img align="center" alt="Sveltepress" src="./packages/docs-site/static/android-chrome-192x192.png" />
  <br>
  Sveltepress
  <br>
  <br>
</h1>

<p align="center">
  <strong>SvelteKit docs &amp; blog SSG</strong> — write Markdown, keep the full power of SvelteKit.<br/>
  Svelte 5 Runes in Markdown · document versioning · i18n · Pagefind / DocSearch
</p>

<p align="center">
  <a href="https://sveltepress.site/"><img alt="Docs" src="https://img.shields.io/badge/docs-sveltepress.site-ff3e00?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@sveltepress/vite"><img alt="npm" src="https://img.shields.io/npm/v/@sveltepress/vite?style=flat-square&color=cb3837" /></a>
  <a href="https://www.npmjs.com/package/@sveltepress/vite"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@sveltepress/vite?style=flat-square" /></a>
  <a href="https://github.com/SveltePress/sveltepress/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/SveltePress/sveltepress?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" /></a>
</p>

<p align="center">
  <a href="https://sveltepress.site/" target="_blank" rel="noopener noreferrer" >
    <img src="./assets/site.png" alt="Sveltepress screenshots" width="600" height="auto">
  </a>
</p>

<p align="center">
  <a href="https://sveltepress.site/" target="_blank" rel="noopener noreferrer" >
    <img src="./assets/lighthouse.png" alt="Sveltepress lighthouse" width="600" height="auto">
  </a>
</p>

> Not affiliated with the archived [GeopJr/SveltePress](https://github.com/GeopJr/SveltePress).

## Why Sveltepress

Inspired by [VitePress](https://vitepress.dev/), built on [SvelteKit](https://kit.svelte.dev/) — so you get a docs/blog toolkit **and** the full SvelteKit surface (SSR, adapters, server routes, hooks).

- **Svelte 5 in Markdown** — Runes, components, and interactive islands inside `.md`
- **Immutable doc versioning** — clean current URLs plus historical snapshots
- **Search that works** — Pagefind by default; DocSearch / Meilisearch when you need them
- **i18n built in** — locales, switcher, version-aware navigation
- **Docs + blog themes** — default docs theme, or [`theme-blog`](https://sveltepress.site/guide/blog-theme/getting-started/) for posts, RSS, OG images

Requires Svelte 5, SvelteKit 2, Vite 8, and Node.js `^20.19.0` or `>=22.12.0`.

## Quick start

```bash
npm create @sveltepress@latest
```

Docs: [sveltepress.site](https://sveltepress.site/) · Blog theme: [getting started](https://sveltepress.site/guide/blog-theme/getting-started/)

## Packages

| Package | Purpose |
|---|---|
| [`@sveltepress/create`](./packages/create/) | Interactive scaffolder for JavaScript and TypeScript Sveltepress sites |
| [`@sveltepress/cli`](./packages/cli/) | Version manifest, documentation snapshot, and validation CLI |
| [`@sveltepress/vite`](./packages/vite/) | Core Vite and SvelteKit integration, Markdown pipeline, and version routing |
| [`@sveltepress/theme-default`](./packages/theme-default/) | Default documentation theme with navigation, search, and content features |
| [`@sveltepress/theme-blog`](./packages/theme-blog/) | Static magazine-style blog theme with posts, pagination, RSS, OG images, and Pagefind |
| [`@sveltepress/twoslash`](./packages/twoslash/) | TypeScript and Svelte hover information for Shiki code blocks |
| [`@sveltepress/docsearch`](./packages/docsearch/) | Algolia DocSearch UI component for Sveltepress themes |
| [`@sveltepress/meilisearch`](./packages/meilisearch/) | Meilisearch search UI integration for Sveltepress themes |

## Contributing

All kinds of contributions are welcome. See [Contributing](./CONTRIBUTING.md).

## Thanks

This project would not exist without:

* [VitePress](https://vitepress.dev/)
* [SvelteKit](https://kit.svelte.dev/)
* [Svelte](https://svelte.dev/)
* [Vitest](https://vitest.dev/)
* [Vite](https://vitejs.dev/)
* [UnoCSS](https://github.com/unocss/unocss)
* [Shiki](https://github.com/shikijs/shiki)
* [Remark](https://github.com/remarkjs/remark)
* [Rehype](https://github.com/rehypejs/rehype)
* [Vite PWA](https://github.com/vite-pwa/docs)

## Who's using

[<img src="https://avatars.githubusercontent.com/u/49562229?s=200&v=4" style="width:100px;" />](https://github.com/kryptokrona/kryptokrona-kotlin-sdk)
[<img src="https://svelte.casual-ui.site/logo@3x.png" style="width:100px;" />](https://svelte.casual-ui.site/)
[<img src="https://svelte-u.vercel.app/logo.png" style="width:100px;" />](https://svelte-u.vercel.app/)
[<img src="https://writewithharper.com/circle-logo.png" style="width:100px;" />](https://writewithharper.com/)
[<img src="https://svelte-router.dev/logo-64.svg" style="width: 100px;" />](https://svelte-router.dev)

Using Sveltepress? Open a PR or comment on [#334](https://github.com/SveltePress/sveltepress/issues/334) and we'll add you.

## LICENSE

[MIT](./LICENSE)
