---
title: Introduction
---

Sveltepress is a site build tool  
Inspired by [Vitepress](https://vitepress.vuejs.org/)  
Build on top of [SvelteKit](https://kit.svelte.dev/), [Mdsvex](https://mdsvex.com/), [Unocss](https://github.com/unocss/unocss)


## Project structure

Exactly the same with [Project structure - SvelteKit](https://kit.svelte.dev/docs/project-structure)

But you can use .md files for pages or layouts.  
For example:
* `src/routes/+page.md` is recognized as home page
* `src/routes/+layout.md` is used for root custom layout. (But this can not override the theme GlobalLayout) 