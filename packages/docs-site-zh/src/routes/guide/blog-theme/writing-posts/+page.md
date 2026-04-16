---
title: 写文章
---

文章位于 `src/posts/`（可通过 `postsDir` 配置）。每篇文章是一个 `.md` 文件。文件名（去掉 `.md`）即 slug，也是 `/posts/` 下的 URL 路径。

## Frontmatter

```md title="src/posts/my-post.md"
---
title: A new beginning
date: 2026-04-17
author: Dongsheng
tags: [svelte, web]
category: engineering
excerpt: 卡片和 RSS 中展示的一行简介。
cover: /covers/new-beginning.jpg
draft: false
---

在 frontmatter 下方用 Markdown 写正文。
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string | 是 | 显示在文章 Hero 区域和列表卡片上。 |
| `date` | string | 是 | ISO 日期（`YYYY-MM-DD`），决定排序与时间线分组。 |
| `excerpt` | string | 推荐 | 简短描述。用于卡片、RSS、OG。未提供时主题会从正文派生一个。 |
| `tags` | string[] | — | 以药丸链接的形式渲染在文章标题下方。每个标签都有 `/tags/<name>/` 页面。 |
| `category` | string | — | 每篇最多一个。对应 `/categories/<name>/` 页面。 |
| `author` | string | — | 对当前文章覆盖站点级 `author.name`。 |
| `cover` | string | — | 封面图路径或 URL。设置后文章以 `PostCardLarge` 渲染；否则主题会按标签哈希一个渐变色。 |
| `draft` | boolean | — | 草稿会被构建但不会出现在列表、RSS、OG 图片生成和时间线中。 |

## 列表页

- 首页（`/`）以瀑布流网格展示文章，最新一篇特色展示。
- `/timeline/` 按月份分组展示所有非草稿文章。
- `/tags/` 展示所有标签及其计数。
- `/categories/<name>/` 和 `/tags/<name>/` 按对应分类过滤。

## 摘要

未提供 `excerpt` 时主题会从正文首段派生。为了更可控，建议始终显式设置 `excerpt`，尤其是以图片或代码块开头的文章。

## 阅读时长

阅读时长根据字数自动计算，展示在文章卡片、时间线和文章元信息条上。统计基于渲染后的 HTML。

## 草稿

在 frontmatter 设置 `draft: true` 可将文章隐藏于公开列表。文章仍会在构建时写入磁盘（这样你预发布时分享的链接仍然可用），但不会出现在首页、RSS、时间线或 OG 图片集中。

准备好发布时把 `draft` 改为 `false`。

## 相关文章

每个文章页底部都会展示若干相关文章。相关度根据共享标签、共享分类和年份临近度计算——无需配置。
