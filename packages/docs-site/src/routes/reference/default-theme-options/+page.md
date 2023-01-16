---
title: Default theme options
---

## Usage

* Install package
  ```sh
  # via npm
  npm i --save @svelte-press/theme-default

  # via yarn
  yarn add @svelte-press/theme-default

  # via pnpm
  pnpm i @svelte-press/theme-default
  ```
* Usage
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

## Options type

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
}
```

## navbar

* `title`  
  The label text of the navbar item
* `to`  
  The link address
* `items`  
  Children links. If this prop is provided would render a dropdown instead of a single nav link

## github
The github repo link  
Would show a github icon on the navbar when provided

## logo

The logo image  
Would show on the navbar 

## sidebar

* `title`  
  The label text of the sidebar item
* `to`  
  The link address
* `items`  
  Children links. If this prop is provided would render a sidebar group instead of a single sidebar item

## editLink

The link used for bottom edit this page on github button  
For example this site use `https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route`

`:route` represent the route path, for example: /foo/bar/+page.md