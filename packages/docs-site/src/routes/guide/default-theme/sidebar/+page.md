---
title: Sidebar
---

## Introduction

Pass `sidebar` option to theme default to configure sidebar

## Example

```js
const sidebar = {
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