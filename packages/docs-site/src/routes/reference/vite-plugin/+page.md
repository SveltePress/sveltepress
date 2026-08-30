---
title: Vite plugin
---

## Types overview

@code(/../vite/src/types.ts)

## Plugin options

### `siteConfig`

* `title`: The site's title. Would be `'Untitled site'` if not provided.
* `description`: The site's description. Would be `'Build by sveltepress'` if not provided.

### `addInspect`

If set to `true`, will add [Vite plugin inspect](https://github.com/antfu/vite-plugin-inspect).
It is useful to inspect or observe the Vite pipeline.

### `theme`

See [`ResolvedTheme`](#ResolvedTheme) below

### `remarkPlugins`

The remark plugins used for markdown parse.
Read [Remark plugins](https://github.com/remarkjs/remark#plugins) for more details.

:::important[Customize remark/rehype plugins order]

The `remarkPlugins` and `rehypePlugins` can be one of these two format:
1. An array of `Plugins`. The plugins provided here will run after theme provide remark plugins.
2. A function that accept the `themeRemarkPlugins` then return an array of `Plugins`, for example:

```ts title="vite.config.ts"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/* theme options */),
      remarkPlugins: (themeRemarkPlugins) => {
        // Add your custom plugin. Feel free to control the final order to apply all the plugins
        return [
          ...themeRemarkPlugins
        ]
      }
    })
  ]
})
```
:::

### `rehypePlugins`

The rehype plugins used for html generator.
Read [Rehype plugins](https://github.com/rehypejs/rehype#plugins) for more details.

### `llms`

Generate machine-readable documentation indexes during production builds. It is disabled by default.

```ts title="vite.config.ts"
import { sveltepress } from '@sveltepress/vite'

sveltepress({
  siteConfig: {
    title: 'My docs',
    description: 'Documentation for my project',
  },
  llms: {
    enabled: true,
    baseUrl: 'https://docs.example.com',
    filter: (_filePath, frontmatter) => frontmatter.llms !== false,
  },
})
```

| Option | Type | Default | Purpose |
|---|---|---|---|
| `enabled` | `boolean` | `false` | Write `llms.txt` and `llms-full.txt` during a build. |
| `title` | `string` | `siteConfig.title` | Title used in both generated files. |
| `description` | `string` | `siteConfig.description` | Description used in both generated files. |
| `baseUrl` | `string` | `''` | Absolute site origin prepended to route links. |
| `routesDir` | `string` | `'src/routes'` | Directory scanned for pages. |
| `filter` | `(filePath, frontmatter) => boolean` | — | Exclude selected pages. |
| `sort` | `(a, b) => number` | route path | Customize page order. |

The generator reads Markdown pages only; Svelte-only pages and runtime data are not included. With incremental document versions, historical indexes read each page's frozen Markdown artifact rather than current source. Builds write the files into both `static/` and the production bundle so a clean CI build includes them in the deployed output. Decide whether to commit the `static/` copies or ignore and regenerate them consistently in CI.

:::since[Version change discovery]{version="2026-08-28" id="version-change-discovery" summary="Build-time change catalogs are available to themes and custom pages."}
### `versions`

Document version management is discovered from `sveltepress.versions.json` by default. Disable discovery or choose another manifest path explicitly:

```ts
import { sveltepress } from '@sveltepress/vite'

sveltepress({
  versions: false,
})

sveltepress({
  versions: { manifest: 'config/document-versions.json' },
})
```

When enabled, `virtual:sveltepress/versions` exports `changeSets` and `resolveVersionChanges(versionId?)` alongside the manifest and route helpers. See [Document version management](/guide/version-management/) for snapshot and What’s New usage.
:::

## ResolvedTheme

### `name`

The name of the theme.

### `globalLayout`

The absolute path of the global layout. **Should be a svelte file**
For example: `path.resolve(process.cwd(), 'ThemeGlobalLayout.svelte')`

### `pageLayout`

The absolute path of the page layout. **Should be a svelte file**
For example: `path.resolve(process.cwd(), 'ThemePageLayout.svelte')`

### `vitePlugins`

* If passed a plugin or a group of plugins, these plugins would applied in before `sveltepress`
* If passed a function, it will accept the `sveltepress` plugin and need to return a group of plugins.
  You can customize the `sveltepress` plugin order in your returned plugin chain.

:::info[About theme vite plugins]{icon=vscode-icons:file-type-vite}
  It maybe a little strange that theme has vite plugins.
  But it is useful when the theme want's to add some [virtual modules](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention) or write some temp files.
:::

### `highlighter`

Used for code highlighting.
For example, the default theme use [Shiki](https://github.com/shikijs/shiki).
You can check the [default theme highlighter source code](https://github.com/SveltePress/sveltepress/blob/main/packages/theme-default/src/markdown/highlighter.ts) for detailed usage.

### `remarkPlugins`

The remark plugins used for Markdown parsing.
Read [Remark plugins](https://github.com/remarkjs/remark#plugins) for more details.

### `rehypePlugins`

The rehype plugins used for HTML generation.
Read [Rehype plugins](https://github.com/rehypejs/rehype#plugins) for more details.

:::important[Plugins order]{icon=solar:reorder-outline}
The remark and rehype plugins that theme provide would be called before the plugins provide by vite plugin.
For example:
```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

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

This module holds the `siteConfig`. For example:

```svelte live
<script>
  import siteConfig from 'virtual:sveltepress/site'
</script>

<p>The site title is: {siteConfig.title}</p>
<p>The site description is: {siteConfig.description}</p>
```

## Low level API

The `@sveltepress/vite` package has a low level function `mdToSvelte`.

It is used for all the major Markdown rendering in Sveltepress.

It can be used for a more basic Markdown render engine involved with Svelte.

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

## Working with TypeScript

You need to include `@sveltepress/vite/types` in your `src/app.d.ts` to get plugin options and virtual module's type tips

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// Your other types
```
