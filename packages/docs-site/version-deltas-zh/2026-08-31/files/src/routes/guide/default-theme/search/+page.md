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

:::note[生产构建]
自定义 `search` 的源码路径会被打进静态生产构建：主题在构建期解析配置的 `.svelte` 路径，并以懒加载 chunk 的形式加载，无需额外运行时配置。请按上文用源码路径配置包装组件；直接传组件对象不受支持——主题选项会以 JSON 序列化到客户端，组件对象会被丢弃。如果生产部署里搜不到自定义搜索，请确认 `search` 是源码路径字符串。
:::

如需接入其他搜索服务，也可以使用同一个 `search` 入口提供自己的 Svelte 包装组件。搜索生效优先级为：自定义 `search` 组件 > 显式配置的 `docsearch` > 默认内置的 `LocalSearch`。

## 多语言与版本化站点下的搜索

当站点同时使用 i18n 多语言与版本管理时，搜索按语言、按版本隔离，面向爬虫的输出也与站点实际的 URL 结构保持一致（`/`、`/zh/`、`/bn/`、`/v/<id>/…`、`/zh/v/<id>/…`）。

### 按语言隔离的搜索

每个语言（locale）携带各自的主题选项，因此可以为每个语言配置独立的 DocSearch 索引——迁移前的文档站就是每种语言一个索引：

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        // 所有语言共享的站点级配置（logo、github、pwa 等）
      }),
      locales: {
        '/': {
          lang: 'en',
          label: 'English',
          theme: {
            docsearch: {
              appId: 'YOUR_APP_ID',
              apiKey: 'YOUR_SEARCH_API_KEY',
              indexName: 'sveltepress',
            },
          },
        },
        '/zh/': {
          lang: 'zh',
          label: '中文',
          theme: {
            docsearch: {
              appId: 'YOUR_APP_ID',
              apiKey: 'YOUR_SEARCH_API_KEY',
              indexName: 'cn',
            },
          },
        },
      },
    }),
  ],
})
```

导航栏会在当前索引或版本变化时重建 DocSearch 组件，因此切换语言或版本都会查询到正确的索引。

### 按版本隔离的搜索

manifest 中的每个版本都可以携带 `search` 元数据。当读者停留在某个历史版本的页面（`/v/<id>/…`）时，主题会把 DocSearch 切换到配置的 `indexName`，并把 `facetFilters` 合并进查询：

```json title="sveltepress.versions.json"
{
  "versions": [
    {
      "id": "2026-08-28",
      "search": {
        "indexName": "sveltepress-v2026-08-28",
        "facetFilters": ["version:2026-08-28"]
      }
    }
  ]
}
```

请让爬虫侧的 facet 标记与此元数据保持一致。没有配置 `search` 的历史版本会显示「此文档版本不提供搜索。」——DocSearch、自定义搜索与内置本地搜索一致。

### 抓取与结果 URL

生成的 `sitemap.xml` 会列出每个语言的当前页面与所有符合条件的历史版本页面，并带 hreflang 备用地址；EOL 历史默认排除，除非该版本显式 `noIndex: false`，且每个版本页面都会输出自己的 `rel="canonical"`。索引记录必须指向这些真实的带前缀 URL——例如中文记录的 `url` 是 `/zh/guide/…`，历史版本记录是 `/v/2026-08-28/guide/…`。

### 自定义搜索组件

导航栏只在当前路由可用搜索时渲染自定义 `search` 组件，按版本重建，并传入两个 props：

- `version` — 当前文档版本对象（`{ id, label, status, … }`），无前缀页面上为当前版本。
- `versionSearch` — 该版本的 `search` 元数据（`{ indexName?, facetFilters? }`），没有则为 `null`。

如果你的索引存放了多个版本，请按 `versionSearch` 中的 facets 过滤结果。记录 URL 必须是完整带前缀的路由。框架不传 locale prop：如果每种语言一个索引，请自行从 `location.pathname` 读取当前语言。
