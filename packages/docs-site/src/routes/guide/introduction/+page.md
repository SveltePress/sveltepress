---
title: Introduction
---

Sveltepress is a SvelteKit docs and blog site builder.
Inspired by [VitePress](https://vitepress.dev/).
Built on [SvelteKit](https://kit.svelte.dev/) and [UnoCSS](https://github.com/unocss/unocss) — so you get a content toolkit and the full SvelteKit surface (SSR, adapters, server routes, hooks).

The navbar **Playground** opens a Feature directory of in-browser Starters. Markdown, Default Theme, and Vite plugin Entries share the Default Theme starter. Document versions ships on a Versions starter (`versions init` / `create` · `versions build`). Internationalization ships on a two-locale starter. Custom theme ships from Playground home only (there is no Guide leaf). Blog theme Entries (Configuration, Writing posts, Features, Customisation) share the Blog starter. Virtual modules is one Reference Entry on the Kitchen-sink starter; Open in Playground on `virtual:sveltepress/site`, `locale`, and `versions` all land there. Kitchen sink is the All features Entry and a Playground chrome CTA (not a site-navbar item). Blog theme and custom theme never live in that tree. Guide pages keep frozen Live code; the Blog demo stays a finished showcase.

## Project structure

Exactly the same as [Project structure - SvelteKit](https://kit.svelte.dev/docs/project-structure)

Except for that you can use .md files for pages or layouts.
For example:
* `src/routes/+page.md` is recognized as home page
* `src/routes/+layout.md` is used for root custom layout

:::tip[Full power of SvelteKit]{icon=logos:svelte-kit}
Sveltepress preserves the full power of SvelteKit. You can do more than SSG.
For example use +page.server.js, +layout.server.js, hooks.server.js to do some server side logic like: Authentication, DB Docking, ...
:::

## Layout hierarchy

:::note[Root layout is required]{icon=ph:layout-duotone}
There must be a `src/routes/+layout.svelte` or `src/routes/+layout.md` as root layout file.
**Otherwise the global layout provided by theme would not working!**
:::

For example if your file tree look like this

```txt
.
├─ src
│  ├─ routes
│  │  └─ +layout.(svelte|md)
│  │  ├─ foo
│  │  │  ├─ +page.(svelte|md)
│  │  │  ├─ +layout.(svelte|md)
```

`theme.globalLayout` > `src/routes/+layout.(svelte|md)` > `theme.pageLayout` > `src/routes/foo/+layout.(md|svelte)` > `src/routes/foo/+page.md`

Here's a graph to help you understand

<script>
  import LayoutHierarchy from '$lib/components/LayoutHierarchy.svelte'
</script>

<LayoutHierarchy />

## Configuration

Sveltepress's config is passed to `@sveltepress/vite` vite plugin, all options are fully typed.

Read [Vite plugins options](/reference/vite-plugin/) for more details.

:::since[Internationalization guide]{version="2026-09-03" id="intro-link-i18n" summary="Link to the new multi-locale guide."}
Building a multi-language site? See [Internationalization](/guide/i18n/).
:::

## Deployment

It is recommended to read [Adapters - SvelteKit](https://kit.svelte.dev/docs/adapters) first.
If you use `npm/yarn/pnpm create @sveltepress` to create a new project.
The [Adapter Static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) would be used as default.

But feel free to change to any adapters you want.
