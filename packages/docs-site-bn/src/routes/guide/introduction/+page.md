---
title: Introduction
---

Sveltepress is a site build tool.  
Inspired by [Vitepress](https://vitepress.vuejs.org/).  
Build on top of [SvelteKit](https://kit.svelte.dev/), [Unocss](https://github.com/unocss/unocss).


## Project structure

Exactly the same as [Project structure - SvelteKit](https://kit.svelte.dev/docs/project-structure)

Except for that you can use .md files for pages or layouts.  
For example:
* `src/routes/+page.md` is recognized as home page
* `src/routes/+layout.md` is used for root custom layout

:::tip[Full power of Sveltekit]{icon=logos:svelte-kit}
Sveltepress preserves the full power of sveltekit. You can do more than SSG.
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

<img src="/layout-hierarchy.png" style="width:100%;" alt="" />

## Configuration

Sveltepress's config is passed to `@sveltepress/vite` vite plugin, all options are fully typed. 

Read [Vite plugins options](/reference/vite-plugin/) for more details.

## Deployment

It is recommended to read [Adapters - SvelteKit](https://kit.svelte.dev/docs/adapters) first.  
If you use `npm/yarn/pnpm create @sveltepress` to create a new project.  
The [Adapter Static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) would be used as default.

But feel free to change to any adapters you want.
