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

## Plugin Options

```ts
interface WithTitle {
  title: string
}

interface LinkItem extends WithTitle {
  to: string
}

interface LinkGroup extends WithTitle {
  items: (LinkItem | LinkGroup)[]
}
interface DefaultThemeOptions {
  navbar: Array<LinkItem | LinkGroup>
  github?: string
  logo?: string
  sidebar?: Record<string, (LinkItem | LinkGroup)[]>
  editLink?: string
  docsearch?: {
    appId: string
    apiKey: string
    indexName: string
  }
}
```

### `navbar`

* `title`  
  The label text of the navbar item
* `to`  
  The link address
* `items`  
  Children links. If this prop is provided would render a dropdown instead of a single nav link

### `github`
The github repo link  
Would show a github icon on the navbar when provided

### `logo`

The logo image  
Would show on the navbar 

### `sidebar`

* `title`  
  The label text of the sidebar item
* `to`  
  The link address
* `items`  
  Children links. If this prop is provided would render a sidebar group instead of a single sidebar item

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