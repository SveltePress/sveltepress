---
title: Vite plugin
---

## Plugin options

@code(/../vite/src/types.ts,25,29)

### siteConfig

@code(/../vite/src/types.ts,12,15)

* `title`: The site title. Would be `'Untitled site'` if not provided.
* `description`: The site description. Would be `'Build by sveltepress'` if not provided.

### addInspect

If set to `true`, will add [Vite plugin inspect](https://github.com/antfu/vite-plugin-inspect).   
It is useful to inspect or observe the vite pipeline.

### theme

@code(/../vite/src/types.ts,16,24)

* `name`   
  The name of theme
* `globalLayout`  
  The absolute path of global layout. **Should be a svelte file**  
  For example: `path.resolve(process.cwd(), 'CustomLayout.svelte')`
* `pageLayout`  
  The absolute path of page layout. **Should be a svelte file**  
  For example: `path.resolve(process.cwd(), 'CustomLayout.svelte')`
* `vitePlugins`  
  Vite plugins  
  It maybe a little strange that theme has vite plugins.  
  But it is useful when the theme want's to add some [virtual modules](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention) or write some temp file. 
* `highlighter`  
  Used for code highlighting.  
  For example, the default theme use [shiki](https://github.com/shikijs/shiki).  
  You can check the [Default theme highlighter source code](https://github.com/Blackman99/sveltepress/blob/256c1abe6be51d37fa1ff5f9148368207c47a7ae/packages/theme-default/src/markdown/highlighter.ts) for detail usage.
* `remarkPlugins`  
  The remark plugins used for markdown parse.  
  Read [Remark plugins](https://github.com/remarkjs/remark#plugins) for more details. 
* `rehypePlugins`  
  The rehype plugins used for html generator.
  Read [Rehype plugins](https://github.com/rehypejs/rehype#plugins) for more details.
* `safelist`  
  The `safelist` for Unocss.  
  Read [Unocss safelist](https://github.com/unocss/unocss#safelist) for more details.

## Virtual modules

### `virtual:sveltepress/site`

This module hold the siteConfig. Here's an example

```svelte live
<script>
  import siteConfig from 'virtual:sveltepress/site'
</script>

<p>The site title is: {siteConfig.title}</p>
<p>The site description is: {siteConfig.description}</p>
```

## Working with typescript

You need to include `@svelte-press/vite/types` in your src/app.d.ts to get plugin options and virtual modules type tips

```ts title="/src/app.d.ts"
/// <reference types="@svelte-press/vite/types" />

// Your other types
```
