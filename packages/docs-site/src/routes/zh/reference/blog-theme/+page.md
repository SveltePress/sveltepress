---
title: 博客主题
versionChanges:
  exclude: true
---

`@sveltepress/theme-blog` 提供了专为 SveltePress 设计的现代化响应式博客主题，开箱即用支持文章列表、分页、标签、分类、阅读时间预估、RSS 订阅源生成以及 Giscus 评论系统。

## 安装

```sh
pnpm add -D @sveltepress/theme-blog
```

## Vite 配置

```ts title="vite.config.ts"
// @noErrors
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        author: {
          name: 'Jane Doe',
          avatar: '/avatar.png',
          bio: '专注于 Web 前端技术分享。',
        },
        pageSize: 10,
      }),
    }),
  ],
})
```

## 主题选项

* `author`：`AuthorProfile | string` - 作者详细信息，包括 `name`、`avatar`、`bio` 以及 `socials`。
* `logo`：`string` - 存放于 `static/` 目录下的博客 Logo 路径。
* `footer`：`string` - 自定义页脚文案或 Markdown。
* `postsDir`：`string` - Markdown 文章目录（默认为 `'src/routes/posts'`）。
* `pageSize`：`number` - 每页展示的文章数量（默认：`10`）。
* `themeColor`：`ThemeColor` - 主题配色方案（`primary`、`secondary`、`bg`、`surface`）。
* `giscus`：`GiscusConfig` - Giscus 评论系统配置（`repo`、`repoId`、`category`、`categoryId`）。
* `socials`：`AuthorSocials` - 社交链接（GitHub、Twitter/X、Mastodon、Bluesky、RSS 及邮箱）。
* `pwa`：`SvelteKitPWAOptions` - PWA 服务线程选项。
* `highlighter`：Shiki 代码高亮配置选项。

## 虚拟模块

博客主题的 Vite 插件提供了一系列用于查询博客内容的虚拟模块：

| 模块名 | 导出项 / 类型 | 说明 |
| --- | --- | --- |
| `virtual:sveltepress/blog-config` | `blogConfig: BlogThemeOptions` | 传递给 `blogTheme()` 的已解析博客配置。 |
| `virtual:sveltepress/blog-posts-meta` | `posts: BlogPostMeta[]` | 所有已发布文章的轻量级元数据列表。 |
| `virtual:sveltepress/blog-post/<slug>` | `default: BlogPost` | 包含预渲染 HTML 内容的完整单篇文章数据。 |
| `virtual:sveltepress/blog-tags-index` | `tags: Array<{ name, count }>` | 包含所有标签及其文章数量的列表。 |
| `virtual:sveltepress/blog-tag/<tag>` | `default: BlogPostMeta[]` | 匹配特定标签的所有文章列表。 |
| `virtual:sveltepress/blog-categories-index` | `categories: Array<{ name, count }>` | 包含所有分类及其文章数量的列表。 |
| `virtual:sveltepress/blog-category/<cat>` | `default: BlogPostMeta[]` | 匹配特定分类的所有文章列表。 |
| `virtual:sveltepress/blog-runtime` | `postsJsonDir, tagsJsonDir, categoriesJsonDir` | 服务端 load 函数使用的绝对磁盘缓存路径。**仅限服务端**。 |

## 公共组件

你可以直接引入并复用主题的内置 Svelte 组件：

* `@sveltepress/theme-blog/AuthorCard.svelte` - 紧凑型作者卡片。
* `@sveltepress/theme-blog/AuthorProfile.svelte` - 带有社交链接的完整作者信息。
* `@sveltepress/theme-blog/PostMeta.svelte` - 文章发布日期、阅读时间、作者及标签栏。
* `@sveltepress/theme-blog/GiscusComments.svelte` - 内嵌式 Giscus 评论组件容器。
* `@sveltepress/theme-blog/GlobalLayout.svelte` - 全局布局组件。
* `@sveltepress/theme-blog/PostLayout.svelte` - 单篇文章页面布局组件。
