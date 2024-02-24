---
title: Sidebar
---

## Introduction

Pass `sidebar` option to theme default to configure sidebar

## Example

```ts
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        sidebar: {
          '/foo/': [
            {
              title: 'Bar',
              to: '/foo/bar/',
            },
            {
              title: 'Zoo',
              collapsible: true,
              items: [
                {
                  title: 'Sub item',
                  to: '/sub/item/link'
                }
              ]
            },
            {
              title: 'External github page',
              to: 'https://github.com'
            }
          ]
        }
      })
    })
  ]
})
```

### `title`

The sidebar item title

### `to`

The link address

:::info[Auto external]{icon=ic:sharp-rocket-launch}
Unlike the navbar item, sidebar item use the `Link` component.  
Which means link starts with `http(s)` would be auto recognized as external links.
:::

### `collapsible`

Determine wether the sidebar group is collapsible or not. Default is `false`

### `items`

Sub items

:::info[Nested items]{icon=bi:list-nested}
Nested items is supported
:::