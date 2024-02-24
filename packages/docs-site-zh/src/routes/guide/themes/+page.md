---
title: 主题
---

## 介绍

传递 `theme` 选项至 sveltepress 来使用一个主题

阅读 [Vite 插件选项参考](/reference/vite-plugin/) 来获得更多信息

## 默认主题

### 安装

@install-pkg(@sveltepress/theme-default)

### 在 vite.config.(js|ts) 中配置

```ts title="vite.config.(js|ts)"
// @noErrors
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'

import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltepress(), // [svp! --]
    sveltepress({ // [svp! ++]
      theme: defaultTheme(/** theme options */) // [svp! ++]
    }) // [svp! ++]
  ],
})

export default config
```

阅读[默认主题参考](/reference/default-theme/#主题配置)来获得更多信息