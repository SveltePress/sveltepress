---
title: Sidebar
---

## Introduction

Pass `sidebar` option to theme default to configure sidebar. There are two ways to set up the sidebar:

- **Auto-generated** — Automatically scan your routes directory and build the sidebar from your file structure and frontmatter
- **Manual** — Explicitly define every sidebar item in your Vite config

## Auto-generated sidebar

Set `sidebar` to `{ enabled: true }` to let SveltePress automatically generate the sidebar by scanning your `src/routes/` directory.

```ts
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        sidebar: {
          enabled: true,
        },
      }),
    }),
  ],
})
```

SveltePress will detect top-level route directories (e.g. `/guide/`, `/reference/`) and build sidebar groups from them automatically.

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | — | Set to `true` to enable auto sidebar |
| `routesDir` | `string` | `'src/routes'` | Custom routes directory path |
| `roots` | `string[]` | auto-detected | Root paths to generate sidebar for, e.g. `['/guide/', '/reference/']`. If not specified, auto-detect from top-level route directories |

```txt
sidebar: {
  enabled: true,
  routesDir: 'src/routes',
  roots: ['/guide/', '/reference/'],
}
```

### Frontmatter control

Use frontmatter in your `+page.md` files to control how pages appear in the auto-generated sidebar.

```md
---
title: Getting Started
order: 1
sidebar: true
sidebarTitle: Start Here
collapsible: true
---
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | Inferred from filename | Page title, also used as sidebar label |
| `sidebarTitle` | `string` | — | Override the sidebar label (takes precedence over `title`) |
| `order` | `number` | `100` | Sort order within the same level. Lower numbers appear first |
| `sidebar` | `boolean` | `true` | Set to `false` to exclude this page from the sidebar |
| `collapsible` | `boolean` | — | Whether the sidebar group is collapsible |

:::tip[File naming]{icon=bi:folder2-open}
If no `title` or `sidebarTitle` is provided, the directory name is humanized (e.g. `getting-started` → `Getting Started`).
:::

:::info[HMR support]{icon=mdi:refresh}
When using auto sidebar in dev mode, adding or removing route files will automatically regenerate the sidebar — no restart needed.
:::

## Manual sidebar

Manually define the sidebar structure in your Vite config. This gives you full control over titles, links, grouping, and ordering.

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

```ts
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

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
                  to: '/sub/item/link',
                },
              ],
            },
            {
              title: 'External github page',
              to: 'https://github.com',
            },
          ],
        },
      }),
    }),
  ],
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

Determine whether the sidebar group is collapsible or not. Default is `false`

### `items`

Sub items

:::info[Nested items]{icon=bi:list-nested}
Nested items is supported
:::
