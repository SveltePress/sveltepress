---
title: Default theme
---

## Install

```sh
# via npm
npm install --save @svelte-press/theme-default

# via yarn
yarn add @svelte-press/theme-default

# via pnpm
pnpm install @svelte-press/theme-default
```

## Add in your vite config

```js
// vite.config.(js|ts)
import { defineConfig } from 'vite'
import { sveltepress } from '@svelte-press/vite'
import { defaultTheme } from '@svelte-press/theme-default' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

## Theme Options

@code(/../theme-default/types.d.ts,4,32)

### `navbar`

* `title`  
  The label text of the navbar item
* `to`  
  The link address
* `external`  
  Determine whether the link is external or not.  
  Would render an external icon if set to `true`.
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
  Determine whether the sidebar group is collapsible or not.
* `to`  
  The link address
* `items`  
  Children links. If this prop is provided would render a sidebar group instead of a single sidebar item

Example:

```js
const sidebar = {
  '/foo/': [
    {
      title: 'Bar',
      to: '/foo/bar/',
    },
    {
      title: 'Zoo',
      to: '/foo/zoo/'
    }
  ]
}
```

:::info Auto external
Unlike the navbar item, sidebar item use the `Link` component.  
Which means link starts with `http(s)` would be auto recognized as external links.
:::

### `editLink`

The link used for bottom edit this page on github button  
For example this site use `https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route`

`:route` represent the route path, for example: /foo/bar/+page.md

### `docsearch`

* appId
* apiKey
* indexName

All these values are provided by the docsearch.  
Visit [Docsearch](https://docsearch.algolia.com/) for more details.

## Virtual modules

### `virtual:sveltepress/theme-default`

This module hold the theme options that pass to `defaultTheme()` function.

Here's an example for showing the theme options of this site:

```svelte live
<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
</script>
<p>
  The theme options of this site is: <br />
  {#each Object.entries(themeOptions) as [key, val]}
    <b>{key}</b>: {JSON.stringify(val)} <br />
  {/each}
</p>
<style>
  p {
    word-break: break-all;
  }
</style>
```

## Working with typescript

You need to include `@svelte-press/theme-default/types` in your src/app.d.ts to get theme options and virtual modules type tips

```ts
// src/app.d.ts
/// <reference types="@svelte-press/theme-default/types" />

// Your other types
```
