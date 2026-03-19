---
title: 侧边栏
---

## 介绍

将 `sidebar` 选项传递给默认主题来配置侧边栏。有两种方式来设置侧边栏：

- **自动生成** — 自动扫描路由目录，根据文件结构和 frontmatter 生成侧边栏
- **手动配置** — 在 Vite 配置中显式定义每个侧边栏项

## 自动生成侧边栏

将 `sidebar` 设置为 `{ enabled: true }` 即可让 SveltePress 自动扫描 `src/routes/` 目录来生成侧边栏。

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

SveltePress 会检测顶级路由目录（如 `/guide/`、`/reference/`）并自动构建侧边栏分组。

### 选项

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | — | 设为 `true` 启用自动侧边栏 |
| `routesDir` | `string` | `'src/routes'` | 自定义路由目录路径 |
| `roots` | `string[]` | 自动检测 | 生成侧边栏的根路径，如 `['/guide/', '/reference/']`。未指定时从顶级路由目录自动检测 |

```txt
sidebar: {
  enabled: true,
  routesDir: 'src/routes',
  roots: ['/guide/', '/reference/'],
}
```

### Frontmatter 控制

在 `+page.md` 文件中使用 frontmatter 来控制页面在自动生成侧边栏中的显示方式。

```md
---
title: 快速开始
order: 1
sidebar: true
sidebarTitle: 从这里开始
collapsible: true
---
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 从文件名推断 | 页面标题，同时用作侧边栏标签 |
| `sidebarTitle` | `string` | — | 覆盖侧边栏标签（优先级高于 `title`） |
| `order` | `number` | `100` | 同级排序。数字越小越靠前 |
| `sidebar` | `boolean` | `true` | 设为 `false` 可将此页面从侧边栏中排除 |
| `collapsible` | `boolean` | — | 侧边栏分组是否可折叠 |

:::tip[文件命名]{icon=bi:folder2-open}
如果未提供 `title` 或 `sidebarTitle`，目录名会被自动转换为可读格式（如 `getting-started` → `Getting Started`）。
:::

:::info[HMR 支持]{icon=mdi:refresh}
在开发模式下使用自动侧边栏时，添加或删除路由文件会自动重新生成侧边栏——无需重启。
:::

## 手动配置侧边栏

在 Vite 配置中手动定义侧边栏结构。这让你可以完全控制标题、链接、分组和排序。

:::tip[自动 base]
配置的链接会自动加上 [`base`](https://svelte.dev/docs/kit/$app-paths#base) 前缀
:::

:::important[绝对路径模式]
需要将 [`paths.relative`](https://svelte.dev/docs/kit/configuration#paths) 设为 `false`

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

侧边栏项的标题

### `to`

链接地址

:::info[自动识别外部链接]{icon=ic:sharp-rocket-launch}
与导航栏不同，侧边栏使用 `Link` 组件。
以 `http(s)` 开头的链接会被自动识别为外部链接。
:::

### `collapsible`

决定侧边栏分组是否可折叠。默认为 `false`

### `items`

子项

:::info[嵌套子项]{icon=bi:list-nested}
支持嵌套子项
:::
