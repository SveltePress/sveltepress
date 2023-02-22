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
      to: '/foo/zoo/'
    },
    {
      title: 'External github page',
      to: 'https://github.com'
    }
  ]
}
```

:::info[Auto external]
Unlike the navbar item, sidebar item use the `Link` component.  
Which means link starts with `http(s)` would be auto recognized as external links.
:::