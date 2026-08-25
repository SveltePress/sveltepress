---
title: 搜索
---

对于生产站点，默认主题目前仅支持通过内置 `docsearch` 选项接入 **Algolia DocSearch**。

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

## 自定义搜索与 Meilisearch 的当前状态

公开类型仍保留 `search?: Component | string`，仓库中也有 `@sveltepress/meilisearch` 组件，但目前不要通过 `defaultTheme({ search })` 用于生产环境：

- 主题配置序列化时会丢弃组件对象；
- 字符串路径由浏览器在运行时导入，本地 `/src/...` 模块不会进入生产构建产物。

在运行时接入方式重构前，请使用 `docsearch`，或在默认主题的 `search` 选项之外自行实现搜索。这里保留该选项的说明，是为了明确当前限制，并不代表它已经形成可用的生产合同。
