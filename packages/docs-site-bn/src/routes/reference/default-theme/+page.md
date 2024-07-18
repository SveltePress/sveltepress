---
title: Default theme
---

## Install

@install-pkg(@sveltepress/theme-default)

## Add in your vite config 

```js title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'

import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

## Types overview

@code(/../theme-default/types.d.ts)

## Theme Options

### `navbar`

* `title`  
  The label text of the navbar item
* `to`  
  The link address
* `icon`
  An HTML string. Will show the html content instead of `title`. It is useful to display a custom icon on the navbar
* `external`  
  Determine whether the link is external or not.  
  Would render an external icon if set to `true`
* `items`  
  Children links. If this prop is provided would render a dropdown instead of a single nav link

### `discord`
The discord chat channel link  
Would show a discord icon on the navbar when provided

### `github`
The github repo link  
Would show a github icon on the navbar when provided

### `logo`

The logo image  
Would show on the navbar 

### `sidebar`

An object, key is the group route prefix, value is an array of object with following fields:

* `title`  
  The label text of the sidebar item
* `collapsible`  
  Determine whtheme-default/+paether the sidebar group is collapsible or not.
* `to`  
  The link address
* `items`  
  Children links. If this prop is provided would render a sidebar group instead of a single sidebar item

### `highlighter`

An object that contains custom highlight options.

* `languages` - Customize the supported highlight languages.
Default is: `['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']`
* `themeLight` - The code theme that will be applied in light mode. Default is `vitesse-light`
* `darkTheme` - The code theme that will be applied in dark mode. Default is `night-owl`
* `twoslash` - Set to `true` to enable [Twoslash](/guide/default-theme/twoslash/). Default is `false`

:::important[TIP]
You can get all the supported languages and themes in [Shiki Repo](https://github.com/shikijs/shiki) 
:::

### `editLink`

The link used for bottom edit this page on github button  
For example this site use `https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route`

`:route` represent the route path, for example: /foo/bar/+page.md

### `ga`

The id provided by [Google Analytics](https://analytics.google.com/).  
Something like `G-XXXXXXX`.

Would add gtag script in site head if provided.

### `docsearch`

* appId
* apiKey
* indexName

All these values are provided by the docsearch.  
Visit [Docsearch](https://docsearch.algolia.com/) for more details.

### `pwa`

See [PWA](/guide/default-theme/pwa/) for details.

### `themeColor`

The color of window bar when opened as a local pwa application.

* `light` - the color that applied on light theme
* `dark` - the color that applied on dark theme
* `gradient` - the gradient theme color. Would be applied on home page action button and main title. Default is:
```js
const defaultGradient = {
  start: '#fa709a',
  end: '#fee140',
}
```
* `primary` - the primary theme color of the site
* `hover` - the hovered links color

### `i18n`

The fixed text contents that can be replaced by your config.

* `onThisPage` - The text for "On this page"
* `suggestChangesToThisPage` - The text for "Suggest changes to this page"
* `lastUpdateAt` - The text for "Last update at:"
* `previousPage` - The text for "Previous"
* `nextPage` - The text for "Next"
* `expansionTitle` - The text for "Click to expand/fold code" in markdown or svelte live code
* `pwa` - The pwa prompt relative text contents. All of the following fields correspond to the same text in pwa prompt 
  * `tip`
  * `reload`
  * `close`
  * `appReadyToWorkOffline`
  * `newContentAvailable`
* `footnoteLabel` - The auto generated footnotes title. Default is `"Footnotes"`

### `preBuildIconifyIcons`

The icons in [Iconify](https://iconify.design/) that you want to pre-build for future usage.   
An object, key is the collection name, value is the icons array.  
For example these are the icons this site using:

@code(/vite.config.ts,29,41)

These icons looks like this:

```svelte live
<script>
  import { IconifyIcon } from '@sveltepress/theme-default/components'
  import themeOptions from 'virtual:sveltepress/theme-default'
</script>
<div class="flex items-center gap-4 text-[48px] flex-wrap">
  {#each Object.entries(themeOptions.preBuildIconifyIcons || {}) as [collection, names]}
    {#each names as name}
      <div>
        <IconifyIcon {collection} {name} />
      </div>
    {/each}
  {/each}
</div>
```

## Global context

The global context key is in the `@sveltepress/theme-default/context`. You can get all the contexts with the [`getContext`](https://svelte.dev/docs/svelte#getcontext) API

This is an example:
```svelte live
<script lang="ts">
  import { getContext } from 'svelte'
  import type { SveltepressContext } from '@sveltepress/theme-default/context'
  import { SVELTEPRESS_CONTEXT_KEY } from '@sveltepress/theme-default/context'

  const { isDark } = getContext<SveltepressContext>(SVELTEPRESS_CONTEXT_KEY)
</script>

<div class:dark-text="{$isDark}" class="text-10">
  isDark: {$isDark}
</div>
<style>
  .dark-text {
    --at-apply: 'text-red';
  }
</style>
```

All contexts:
* `$isDark` - Determine the current theme is dark or not. It is a [reactive svelte store](https://svelte.dev/docs/svelte-store).


## Virtual modules

### `virtual:sveltepress/theme-default`

This module hold the theme options that pass to `defaultTheme()` function.

Here's an example for showing the theme options of this site:

```svelte live
<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
</script>
<div class="viewer">
  <pre>
    {JSON.stringify(themeOptions, null, 2)}
  </pre>
</div>
<style>
  .viewer {
    max-height: 40vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
```

## Working with typescript

You need to include `@sveltepress/theme-default/types` in your src/app.d.ts to get theme options and virtual modules type tips

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/theme-default/types" />

// Your other types
```
