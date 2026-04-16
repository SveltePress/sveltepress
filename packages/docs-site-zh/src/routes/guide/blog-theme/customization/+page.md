---
title: 自定义
---

## 调色板

通过 `themeColor` / `themeColorLight` 覆盖深色或浅色调色板：

```ts
// @noErrors
blogTheme({
  themeColor: {
    primary: '#fb923c',
    secondary: '#dc2626',
    bg: '#1a0a00',
    surface: '#2d1200',
  },
  themeColorLight: {
    primary: '#c2410c',
    bg: '#fef9f0',
    surface: '#fde8c8',
  },
})
```

未设置的字段保持主题默认。运行时会作为 CSS 自定义属性注入到 `[data-theme="dark"] .sp-blog-root` 和 `[data-theme="light"] .sp-blog-root` 作用域。

## CSS 自定义属性

所有组件都读取这些变量，你可以在自己的样式里覆盖以做精细调整：

| 变量 | 用途 |
|---|---|
| `--sp-blog-bg` | 页面背景 |
| `--sp-blog-surface` | 卡片/侧边栏背景 |
| `--sp-blog-border` | 分隔线、卡片边框 |
| `--sp-blog-text` | 主文本（标题） |
| `--sp-blog-content` | 正文 |
| `--sp-blog-muted` | 元信息文本（日期、计数） |
| `--sp-blog-primary` | 主色（链接、标签、按钮） |
| `--sp-blog-secondary` | 辅色 |

## 替换组件

`src/routes/` 下的脚手架文件会从 `@sveltepress/theme-blog/components/*` 导入组件。要替换其中任意一个——比如文章卡片——编辑 `src/routes/+page.svelte`，换上你自己的组件：

```svelte title="src/routes/+page.svelte"
<script lang="ts">
  import MyGrid from '$lib/MyGrid.svelte'

  const { data } = $props()
</script>

<MyGrid posts={data.posts} />
```

主题重新导出了以下可复用组件：

- `@sveltepress/theme-blog/PostLayout.svelte`
- `@sveltepress/theme-blog/components/MasonryGrid.svelte`
- `@sveltepress/theme-blog/components/Timeline.svelte`
- `@sveltepress/theme-blog/components/Pagination.svelte`
- `@sveltepress/theme-blog/components/Sidebar.svelte`
- `@sveltepress/theme-blog/components/SearchModal.svelte`
- `@sveltepress/theme-blog/components/ReadingProgress.svelte`
- `@sveltepress/theme-blog/components/GiscusComments.svelte`
- `@sveltepress/theme-blog/components/RelatedPosts.svelte`
- `@sveltepress/theme-blog/components/TaxonomyHeader.svelte`

## 子路径部署

在 `svelte.config.js` 读取 `BASE_PATH`，在 `vite.config.ts` 读取 `SITE_URL`：

```js title="svelte.config.js"
export default {
  kit: {
    paths: {
      base: process.env.BASE_PATH ?? '',
      relative: false,
    },
  },
}
```

```ts title="vite.config.ts"
// @noErrors
blogTheme({
  base: process.env.SITE_URL ?? 'http://localhost:4173',
  // ...
})
```

同时设置两个变量进行构建，例如部署到 GitHub Pages 项目站点 `user.github.io/repo/blog`：

```bash
BASE_PATH=/repo/blog SITE_URL=https://user.github.io/repo/blog \
  pnpm vite build && pnpm pagefind --site dist
```

主题组件中的所有内部链接都使用 SvelteKit 的 `$app/paths` `base`，因此在子路径下也能正确解析。OG 图片 URL 与 RSS 条目 URL 使用 `SITE_URL`，确保社交平台爬虫拿到的是完整绝对路径。

## 增加页面

`src/routes/` 下脚手架未占用的一切都是你的。保持 `src/routes/+layout.svelte` 不动即可让自定义页面自动被 `GlobalLayout` 包裹——每个路由都会渲染在侧边栏 + 主网格之内。
