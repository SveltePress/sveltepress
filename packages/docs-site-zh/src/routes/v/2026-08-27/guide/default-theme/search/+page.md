---
title: 搜索
---

默认主题支持通过 `docsearch` 接入 **Algolia DocSearch**，也支持通过 `search` 接入自定义搜索组件，包括 `@sveltepress/meilisearch`。

## Algolia DocSearch

向 `defaultTheme` 传入 `docsearch` 配置对象，即可在导航栏启用 [Algolia DocSearch](https://docsearch.algolia.com/)。

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

如需接入其他搜索服务，也可以使用同一个 `search` 入口提供自己的 Svelte 包装组件。同时配置 `search` 和 `docsearch` 时，优先使用 `search`。
