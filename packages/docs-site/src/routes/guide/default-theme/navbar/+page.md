---
title: Navbar
---

## Introduction

Pass `navbar` option to theme default to configure navbar

Each item can hold these props:

* `title` - The label text
* `to` - The link address
* `external` - Determine whether the item is an external link
* `items` - Sub links

:::note[One level only]
For now, navbar can only hold one level sub links.  
:::

## Example

```js title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar: [
          {
            title: 'Foo page',
            to: '/foo/'
          },
          {
            title: 'With dropdown',
            items: [
              {
                title: 'Bar page',
                to: '/bar/'
              },
              {
                title: 'External Github page',
                to: 'https://github.com/',
                external: true
              }
            ]
          }
        ]
      })
    })
  ]
})
```
