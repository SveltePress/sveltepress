---
title: Vite plugin
---

## Types overview

@code(/../vite/src/types.ts)

## Plugin options

### `siteConfig`

* `title`: The site title. Would be `'Untitled site'` if not provided.
* `description`: The site description. Would be `'Build by sveltepress'` if not provided.

### `addInspect`

If set to `true`, will add [Vite plugin inspect](https://github.com/antfu/vite-plugin-inspect).   
It is useful to inspect or observe the vite pipeline.

### `theme`

See [ResolvedTheme](#ResolvedTheme) below

### `remarkPlugins`

The remark plugins used for markdown parse.  
Read [Remark plugins](https://github.com/remarkjs/remark#plugins) for more details. 

### `rehypePlugins`  

The rehype plugins used for html generator.
Read [Rehype plugins](https://github.com/rehypejs/rehype#plugins) for more details.

## ResolvedTheme

<!-- @code(/../vite/src/types.ts,13,25) -->

### `name`   

The name of theme

### `globalLayout`  

The absolute path of global layout. **Should be a svelte file**  
For example: `path.resolve(process.cwd(), 'ThemeGlobalLayout.svelte')`

### `pageLayout`  

The absolute path of page layout. **Should be a svelte file**  
For example: `path.resolve(process.cwd(), 'ThemePageLayout.svelte')`
  
### `vitePlugins`  

* If passed a plugin or a group of plugins. These plugins would applied in front of `sveltepress`
* If passed a function. It will accept the `sveltepress` plugin and need to return a group of plugins.  
  You can customize the `sveltepress` plugin order in your returned plugin chain.  

:::info[About theme vite plugins]{icon=vscode-icons:file-type-vite}
  It maybe a little strange that theme has vite plugins.  
  But it is useful when the theme want's to add some [virtual modules](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention) or write some temp files. 
:::

### `highlighter`  

Used for code highlighting.  
For example, the default theme use [shiki](https://github.com/shikijs/shiki).  
You can check the [Default theme highlighter source code](https://github.com/Blackman99/sveltepress/blob/256c1abe6be51d37fa1ff5f9148368207c47a7ae/packages/theme-default/src/markdown/highlighter.ts) for detail usage.

### `remarkPlugins`  

The remark plugins used for markdown parse.  
Read [Remark plugins](https://github.com/remarkjs/remark#plugins) for more details. 

### `rehypePlugins`  

The rehype plugins used for html generator.
Read [Rehype plugins](https://github.com/rehypejs/rehype#plugins) for more details.

:::important[Plugins order]{icon=solar:reorder-outline}
The remark and rehype plugins that theme provide would be called before the plugins provide by vite plugin.
For example:
```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/* theme options */),
      remarkPlugins: [/* yourRemarkPlugin */]
    })
  ]
})
```
yourRemarkPlugin would run after the remark plugins in defaultTheme
:::

### `footnoteLabel`

Customize the footnotes title, default is: `"Footnotes"`

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

## Low level API

The @sveltepress/vite package has a low level api function `mdToSvelte`

It is used for all the major markdown render in Sveltepress.  

It can be used for a more basic markdown render engine involved with Svelte.

Here's usage example:

```ts ln
import { mdToSvelte } from '@sveltepress/vite'

const mdContent = `
---
title: Foo
---
<script>
  const foo = 'bar'
</script>
# Title

foo in script is: {foo}

[Foo Link](https://foo.bar)
`

const { code, data } = await mdToSvelte({
  mdContent,
  remarkPlugins: [], // your custom remark plugins
  rehypePlugins: [], // your custom rehype plugins
  highlighter: async (code, lang, meta) => Promise.resolve('The rendered highlighted code html'), // your custom code highlighter
  filename: 'foo.md', // the virtual file path
})

// The rendered svelte code
code

// The frontmatter object, { title: 'Foo' }
data
```

## Working with typescript

You need to include `@sveltepress/vite/types` in your src/app.d.ts to get plugin options and virtual modules type tips

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// Your other types
```
