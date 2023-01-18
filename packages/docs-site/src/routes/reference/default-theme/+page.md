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

## Theme options

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

## Theme features

### Links

**Input**

```md
[External Link](https://link.address)
[Internal Link](/foo/bar)
```

**Output**

[External Link](https://link.address)  
[Internal Link](/foo/bar)


### Headings & Anchors

All headings in your page md files would render the toc on the right of the page  
As you currently can see on every page  
And multi levels are supported

```md
## Heading1
### Heading1 nested1
### Heading1 nested2

## Heading2
### Heading2 nested1
### Heading2 nested2
```