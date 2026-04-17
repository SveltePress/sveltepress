---
title: 特性
---

除非特别说明，本页所有功能默认开启。

## 带作者身份的侧边栏

左栏展示站点品牌、作者头像 + 姓名 + 简介 + 社交链接、可选的"关于"HTML 块、导航链接、搜索按钮和主题切换按钮。在宽度小于 1024 px 的视口下折叠成顶部条，并隐藏冗余内容（简介、社交、关于）。

头像、姓名、简介和社交链接来自配置中的 `author`，关于块（如果有）来自 `about.html`。

## 阅读进度条

一条 3 px 的进度条固定在视口顶部，随阅读进度填充。仅在文章页渲染。无需配置。

## 首页瀑布流

第一篇文章为特色（全宽卡片，使用封面或渐变色）。其余文章按视口大小流入 1/2/3 列的瀑布流。

有 `cover` 的文章渲染为大卡片；没有封面的渲染为紧凑卡片。主题会根据标签哈希出渐变色，让没有封面的卡片依旧有辨识度。

## 时间线

`/timeline/` 按月分组展示非草稿文章，左侧粘性列显示年月标签，右侧卡片通过导轨相连。IntersectionObserver 会在滚动时为卡片淡入。

## 标签与分类

每个标签和分类都有专属页面，使用同一套瀑布流网格。`/tags/` 还会展示所有标签及其文章数。

在 `navbar` 添加形如 `{ title: 'Tags', to: '/tags/' }` 的条目即可从侧边栏链接过去。

## RSS

每次构建都会将 `rss.xml` 写入 `static/rss.xml`。配置：

```ts
// @noErrors
blogTheme({
  base: 'https://example.com',
  rss: {
    enabled: true, // 默认
    limit: 20, // 默认
    copyright: `© ${new Date().getFullYear()} My Blog`,
  },
})
```

通过 `rss: { enabled: false }` 关闭。

## OG 图片

构建时使用 Satori + resvg 为每篇文章渲染 Open Graph 图片，写入 `static/og/<slug>.png`。站点级图片写入 `static/og/__home.png`。

```ts
// @noErrors
blogTheme({
  ogImage: {
    enabled: true, // 默认
    fontPath: '/abs/path/font.ttf', // 默认 Inter Bold 700
    tagline: '标题下的副标题',
  },
})
```

通过 `enabled: false` 完全跳过生成。

要让 meta 中的 OG URL 是完整绝对路径（Facebook 等大多数爬虫需要），请把 `base` 设为站点完整 URL：`base: 'https://example.com'`。

## 搜索（Pagefind）

`⌘K` / `Ctrl+K` 打开搜索弹窗。Pagefind 是索引器，作为构建后步骤运行：

```bash
pnpm vite build && pnpm pagefind --site dist
```

开发时主题会从上次构建的 `dist/pagefind/` 提供 `/pagefind/`，所以只要构建过一次，开发模式下搜索就能工作。

## 评论（Giscus）

在配置中设置 `giscus`（从 [giscus.app](https://giscus.app/) 获取字段），每篇文章下方会渲染 `GiscusComments`。主题切换（浅/深色）会自动转发到 Giscus iframe。

## 语法高亮

代码块使用 Shiki 高亮，双主题根据 `data-theme` 切换。开启 Twoslash 即可获得 TypeScript 悬浮信息：

```ts
// @noErrors
blogTheme({
  highlighter: {
    themeDark: 'night-owl',
    themeLight: 'vitesse-light',
    twoslash: true,
  },
})
```

代码块还支持复制按钮、可选标题、行号、行高亮、diff 标记和聚焦变暗——围栏语法与默认主题共用，参见默认主题文档。

## 主题切换

侧边栏的日/月按钮循环切换 `system → dark → light`。首次构建时主题会向 `src/app.html` 注入防 FOWT 脚本，确保首屏前就应用正确主题。

## 自动生成的路由

见 [快速上手](../getting-started/)。脚手架只写入不存在的文件，所以你的自定义在升级时始终安全。
