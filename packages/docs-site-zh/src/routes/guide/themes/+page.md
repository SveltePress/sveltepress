---
title: 主题
---

## 介绍

传递 `theme` 选项至 sveltepress 来使用一个主题

阅读 [Vite 插件选项参考](/reference/vite-plugin/) 来获得更多信息

| 选择 | 适用场景 | 内容模型 | 搜索 |
|---|---|---|---|
| 默认主题 | 文档、产品指南和 API 参考 | 使用 Markdown 或 Svelte 编写的 SvelteKit 路由 | Algolia DocSearch；自定义搜索钩子暂不可用于生产环境 |
| 博客主题 | 编辑型站点和按时间发布的内容 | `src/posts` 中的 Markdown 与自动生成路由 | 内置 Pagefind |

## 默认主题

### 安装

@install-pkg(@sveltepress/theme-default)

### 在 vite.config.(js|ts) 中配置

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]
import { sveltepress } from '@sveltepress/vite'

// @noErrors
import { defineConfig } from 'vite'

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

## 博客主题

博客主题提供文章索引、分页、标签、分类、RSS、Open Graph 图片、相关文章、评论和 Pagefind 搜索界面。它生成静态站点，当前需要 `@sveltejs/adapter-static`，并在 Vite 构建后运行 Pagefind。

从[博客主题快速上手](/guide/blog-theme/getting-started/)开始，并把[在线 Demo](https://sveltepress.github.io/sveltepress/blog-demo/)作为可运行参考。
