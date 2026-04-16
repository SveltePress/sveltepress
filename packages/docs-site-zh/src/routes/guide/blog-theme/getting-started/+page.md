---
title: 快速上手
---

`@sveltepress/theme-blog` 是一款杂志风格的博客主题，自带左侧边栏、瀑布流文章网格、自动生成的单篇 OG 图片、RSS、Pagefind 搜索和 Giscus 评论。本页演示如何从零搭建一个可运行的博客。

## 安装

```bash
pnpm add -D @sveltepress/vite @sveltepress/theme-blog @sveltejs/kit @sveltejs/adapter-static svelte vite
```

主题依赖 `@sveltejs/adapter-static`，因为它会生成完全静态的站点（预渲染 HTML、JSON、RSS 与 OG 图片）。

## 配置 Vite

```ts title="vite.config.ts"
// @noErrors
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        title: 'My Blog',
        description: 'Thoughts on Svelte and the web.',
        base: 'https://example.com',
        author: {
          name: 'Your Name',
          avatar: '/avatar.png',
          bio: '侧边栏展示的简短介绍。',
          socials: {
            github: 'your-handle',
            twitter: 'your-handle',
            rss: '/rss.xml',
          },
        },
        navbar: [
          { title: '首页', to: '/' },
          { title: '时间线', to: '/timeline/' },
          { title: '标签', to: '/tags/' },
        ],
      }),
    }),
  ],
})
```

## 配置 SvelteKit

```js title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  extensions: ['.svelte'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      fallback: '404.html',
    }),
    prerender: {
      handleMissingId: 'ignore',
      handleUnseenRoutes: 'ignore',
    },
    paths: {
      base: process.env.BASE_PATH ?? '',
      relative: false,
    },
  },
  compilerOptions: {
    runes: true,
  },
}
```

`BASE_PATH` 用于在子路径下部署（例如 GitHub Pages 的项目站点）。根路径部署时保持该环境变量未设置即可。

## 写第一篇文章

新建 `src/posts/hello-world.md`：

```md title="src/posts/hello-world.md"
---
title: Hello world
date: 2026-04-17
tags: [intro]
category: meta
excerpt: 博客的第一篇文章。
---

# Hello

欢迎来到我的博客。一切都是 Markdown。
```

## 自动生成的路由

下次执行 `vite dev` 或 `vite build` 时，主题会在这些文件不存在时写入它们。你可以自由编辑——脚手架只创建缺失的文件。

| 路径 | 作用 |
|---|---|
| `src/routes/+layout.ts` | 启用预渲染并设置 `trailingSlash: 'always'` |
| `src/routes/+layout.svelte` | 用 `GlobalLayout` 包裹所有页面 |
| `src/routes/+page.{server.ts,svelte}` | 分页的首页 |
| `src/routes/page/[n]/...` | 第 2 页及之后的列表 |
| `src/routes/posts/[slug]/...` | 单篇文章页 |
| `src/routes/tags/+page.svelte` | 标签索引 |
| `src/routes/tags/[tag]/...` | 按标签过滤的文章 |
| `src/routes/categories/[cat]/...` | 按分类过滤的文章 |
| `src/routes/timeline/+page.svelte` | 归档时间线 |

## 构建

```bash
pnpm vite build && pnpm pagefind --site dist
```

Pagefind 步骤会对构建产物建立索引，以便搜索弹窗（`⌘K` / `Ctrl+K`）能正常工作。如果你不用搜索可以跳过这一步。

最终的 `dist/` 是一个可以部署到任意静态主机的静态站点。
