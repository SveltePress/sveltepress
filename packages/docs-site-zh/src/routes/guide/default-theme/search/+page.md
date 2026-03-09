---
title: 搜索
---

Sveltepress 默认主题支持三种方式为站点添加搜索功能：

- **Algolia DocSearch** — 通过内置的 `docsearch` 选项
- **Meilisearch** — 通过 `@sveltepress/meilisearch` 和 `search` 选项
- **自定义搜索** — 将任意 Svelte 组件或模块路径字符串传给 `search` 选项

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
DocSearch 对开源文档站点免费开放。在 [docsearch.algolia.com](https://docsearch.algolia.com/apply/) 提交申请。
:::

## Meilisearch

[Meilisearch](https://www.meilisearch.com/) 是一款开源的自托管搜索引擎。结合 `@sveltepress/meilisearch` 包和 `search` 选项，即可将其集成到站点中。

### 安装

@install-pkg(@sveltepress/meilisearch)

### 配置

将 `@sveltepress/meilisearch` 导出的 `Search.svelte` 组件路径传给 `search` 选项：

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        search: '@sveltepress/meilisearch/Search.svelte',
      }),
    }),
  ],
})
```

`Search.svelte` 组件接受以下 props。你可以通过创建一个包装组件来传入这些 props。

| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `host` | `string` | ✅ | Meilisearch 实例的 URL |
| `apiKey` | `string` | ✅ | 仅搜索用的 API key |
| `indexName` | `string` | ✅ | 需要搜索的索引名称 |
| `placeholder` | `string` | — | 搜索输入框的占位文字（默认：`'Search...'`） |
| `limit` | `number` | — | 最多展示的结果数量（默认：`10`） |

:::tip[自托管 vs Meilisearch Cloud]
你可以自行托管 Meilisearch，也可以使用 [Meilisearch Cloud](https://cloud.meilisearch.com/)。`host` 指向你所选择的部署地址即可。
:::

## 自定义搜索

`search` 选项同样可以直接接受 Svelte `Component`，让你自由接入任何搜索库：

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'
import MySearchComponent from './src/components/MySearchComponent.svelte'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        search: MySearchComponent,
      }),
    }),
  ],
})
```

:::note[search 与 docsearch 的优先级]
当 `search` 和 `docsearch` 同时配置时，`search` 优先，`docsearch` 将被忽略。
:::
