---
title: Google Analytics
---

## 介绍 

传递 `ga` 选项给默认主题来使用 Google Analytics  
该项值从这里获取 [Google Analytics](https://analytics.google.com/analytics/web/)，形如  `G-XXXXXXXXX`.  

如果配置了该项，将会自动添加 `gtag` 相关脚本

## 示例配置

```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        // Other theme config
        ga: 'G-XXXXXXXXX' // [svp! ++]
      })
    })
  ],
})
```