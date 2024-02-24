---
title: Docsearch
---

传递 `docsearch` 选项给默认主题来为站点的导航栏上添加 [Docsearch](https://docsearch.algolia.com/)

`docsearch` 具有这几个属性： `appId`, `apiKey`,`indexName`，都提供自 Docsearch

```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        docsearch: {
          appId: 'XXX',
          apiKey: 'XXX',
          indexName: 'XXX',
          // 其他 Docsearch 支持的选项
        }
      })
    })
  ]
})
```