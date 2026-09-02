---
title: 搜索
---

SveltePress 默认主题开箱即用内置了基于 [Pagefind](https://pagefind.app/) 的**本地搜索**，无需任何额外配置。此外，默认主题支持通过 `docsearch` 接入 **Algolia DocSearch**，也支持通过 `search` 接入自定义搜索组件，包括 `@sveltepress/meilisearch`。

## 本地搜索（默认推荐）

本地搜索开箱即用，零配置即可使用。在构建文档站点（`pnpm build`）时，SveltePress 会自动运行 Pagefind 索引全部静态 HTML 页面，并将搜索资源生成在 `/pagefind/` 目录下。

### 特性亮点

- **零配置**：无需申请外部 API Key 或远程索引服务，即装即用。
- **离线与纯静态**：在浏览器端完全由 WebAssembly 驱动，极速且注重隐私。
- **多语言自动过滤**：自动识别 `<html lang="...">` 属性，默认在当前语言范围内执行检索。
- **键盘快捷交互**：支持通过 `Cmd+K`（macOS）或 `Ctrl+K`（Windows/Linux）快捷键打开，支持方向键导航、Enter 确认选择、Escape 关闭。
- **开发模式友好提示**：在开发模式（`pnpm dev`）下，搜索弹窗会清晰提示索引在生产构建后生成。

### 禁用本地搜索

如果需要完全禁用搜索功能：

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        search: false,
      }),
    }),
  ],
})
```

也可以在 Vite 插件中单独关闭构建期索引器：

```ts title="vite.config.(js|ts)"
import { sveltepress } from '@sveltepress/vite'

sveltepress({
  pagefind: false,
})
```

## Algolia DocSearch

向 `defaultTheme` 传入 `docsearch` 配置对象，即可在导航栏改用 [Algolia DocSearch](https://docsearch.algolia.com/)。

必填字段为 `appId`、`apiKey` 和 `indexName`，同时也支持所有其他 [DocSearch 选项](https://docsearch.algolia.com/docs/api)。

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        docsearch: {
          appId: 'YOUR_APP_ID',
          apiKey: 'YOUR_SEARCH_API_KEY',
          indexName: 'YOUR_INDEX_NAME',
        },
      }),
    }),
  ],
})
```

:::note[申请 DocSearch]
DocSearch 对开源文档站点免费，可前往 [docsearch.algolia.com](https://docsearch.algolia.com/apply/) 申请。
:::

## Meilisearch

`@sveltepress/meilisearch` 是官方支持的 Meilisearch 搜索组件。先安装依赖：

@install-pkg(@sveltepress/meilisearch)

创建一个包装组件，并传入 Meilisearch 连接配置：

```svelte title="src/lib/MeilisearchSearch.svelte"
<script lang="ts">
  import Search from '@sveltepress/meilisearch/Search.svelte'
</script>

<Search
  host="https://search.example.com"
  apiKey="YOUR_SEARCH_ONLY_KEY"
  indexName="docs"
/>
```

然后把包装组件路径传给默认主题的自定义搜索入口：

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  search: '/src/lib/MeilisearchSearch.svelte',
})
```

该组件只查询已经建立的 Meilisearch 索引，不负责创建索引。每条记录应提供 `id`、`title`、`content`，以及 `url` 或 `path`。浏览器端必须使用仅有搜索权限的 API Key。

:::warning[已知生产构建缺陷]
自定义搜索 API 和 `@sveltepress/meilisearch` 组件均受支持，上述源码路径配置在开发环境中可以工作。但当前默认主题运行时会把 `.svelte` 路径留给浏览器动态导入，因此静态生产构建不会打包这个包装组件；直接传入组件对象也会在主题配置序列化时丢失。这是默认主题的生产构建缺陷，并不表示不支持 M Search。在运行时接入修复前，请务必验证实际生产部署。
:::

如需接入其他搜索服务，也可以使用同一个 `search` 入口提供自己的 Svelte 包装组件。搜索生效优先级为：自定义 `search` 组件 > 显式配置的 `docsearch` > 默认内置的 `LocalSearch`。
