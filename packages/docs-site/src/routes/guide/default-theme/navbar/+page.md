---
title: Navbar
---

:::tip[Auto base]
The links configured will be auto prefixed with [`base`](https://svelte.dev/docs/kit/$app-paths#base)
:::

:::important[Absolute mode]
You need to set [`paths.relative`](https://svelte.dev/docs/kit/configuration#paths) to `false`

```js title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    paths: {
      relative: false, // [svp! ++]
    },
  },
}

export default config
```
:::

## Introduction

Pass `navbar` option to theme default to configure navbar

Each item can hold these props:

* `title` - The label text
* `to` - The link address
* `icon`
  An HTML string. Will show the html content instead of `title`. It is useful to display a custom icon on the navbar. For example a twitter svg icon navbar item would be like this:
  ```js
  const twitterNavItem = {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path fill="currentColor"
          d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"
        />
    </svg>`,
    to: 'https://twitter.com/'
  }
  ```
* `external` - Determine whether the item is an external link
* `items` - Sub links

:::note[One level only]{icon=carbon:tree-view-alt}
For now, navbar can only hold one level sub links.
:::

## Example

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

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

:::since[Section tabs]{version="2026-09-17" id="theme-section-tabs" summary="sectionTabs adds a row of section tabs under the navbar, and the sidebar follows the active tab."}
## Section tabs

Pass `sectionTabs` to show a row of tabs under the navbar, one tab per documentation section, like the tabs on this site. The sidebar follows the active tab: give each section its own [sidebar](/guide/default-theme/sidebar/) key, and point each tab at a page in that section.

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        sectionTabs: [
          { title: 'Get started', to: '/guide/introduction/', icon: 'tabler:rocket' },
          { title: 'Markdown', to: '/guide/markdown/basic-writing/', icon: 'tabler:markdown' },
          { title: 'Reference', to: '/reference/vite-plugin/', icon: 'tabler:code' },
        ],
        sidebar: {
          '/guide/': [/* Get started pages */],
          '/guide/markdown/': [/* Markdown pages */],
          '/reference/': [/* Reference pages */],
        },
      }),
    }),
  ],
})
```

Each tab can hold these props:

* `title` - The tab label
* `to` - The section's landing page. Like navbar links, it follows the active locale and documentation version. External URLs open in a new tab.
* `icon` - Optional. An Iconify icon in `collection:name` form, such as `tabler:rocket`, or an HTML string such as an inline SVG. Iconify icons need the matching `@iconify-json/*` package. The theme pre-builds the icons of the `sectionTabs` passed to `defaultTheme()`; add icons used only by a locale's tabs to `preBuildIconifyIcons`.
* `activeMatch` - Optional. A route prefix, or an array of prefixes, that makes the tab active.

A tab is active while the current page is inside its section. By default, the section is the most specific sidebar key that contains the tab's `to` link: `/guide/markdown/` for the Markdown tab above. A tab whose link is under no sidebar key is active on its own page and the pages below it. Set `activeMatch` when sections don't line up with sidebar keys. When several tabs match, the most specific one wins.

The tabs travel with the sidebar, so they stay hidden on the home page and on pages whose frontmatter sets `sidebar: false`, `header: false`, or `layout: false`. Below the `950px` breakpoint, they move to the top of the sidebar drawer.

On a multi-language site, set `sectionTabs` in each locale's `theme`, as with `navbar`, and translate the navigation label with `i18n.sectionTabsLabel`. Historical documentation versions show the current tabs; each link stays inside the frozen version when that version has the page.
:::
