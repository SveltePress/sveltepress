---
title: 配置
---

所有选项都通过 `vite.config.ts` 中的 `blogTheme()` 传入。

## `BlogThemeOptions`

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `string` | — | 站点标题。用于 `<title>`、侧边栏品牌名、OG 标签和 RSS。 |
| `description` | `string` | — | 站点描述。用于 meta 和 OG。 |
| `base` | `string` | — | 站点的完整 URL（例如 `https://example.com`），用于生成绝对 RSS 链接与 OG 图片 URL。 |
| `author` | [`AuthorProfile`](#authorprofile) | — | 显示在侧边栏的作者信息。 |
| `about` | `{ html: string }` | — | 渲染在侧边栏作者信息下方的原始 HTML（请保持简短——"关于"页已不再独立存在）。 |
| `navbar` | `Array<{ title, to }>` | — | 作者信息下方的导航链接。`to` 会自动拼接 SvelteKit 的 `base`。 |
| `themeColor` | [`ThemeColor`](#themecolor) | Ember 配色 | 深色模式调色板覆盖。 |
| `themeColorLight` | [`ThemeColor`](#themecolor) | 暖色奶油 | 浅色模式调色板覆盖。 |
| `defaultMode` | `'system' \| 'dark' \| 'light'` | `'system'` | 用户切换前的初始颜色模式。 |
| `postsDir` | `string` | `'src/posts'` | 扫描 `*.md` 文章的目录。 |
| `pageSize` | `number` | `12` | 首页每页展示的文章数。 |
| `highlighter` | [`HighlighterOptions`](#highlighteroptions) | — | Shiki/Twoslash 选项。 |
| `rss` | `{ enabled, limit, copyright }` | 开启，20 | RSS 生成。写入 `static/rss.xml`。 |
| `ogImage` | `{ enabled, fontPath, tagline }` | 开启 | 通过 Satori 为每篇文章生成 OG 图片。 |
| `giscus` | [`GiscusConfig`](#giscusconfig) | — | 设置后启用基于 GitHub Discussions 的评论。 |

## `AuthorProfile`

```ts
interface AuthorProfile {
  name: string
  avatar?: string // 绝对 URL 或 /-开头的 static/ 路径
  bio?: string
  socials?: {
    github?: string // 用户名，非 URL
    twitter?: string // 用户名，非 URL
    mastodon?: string // 完整的资料页 URL
    bluesky?: string // 形如 'name.bsky.social' 的 handle
    email?: string
    website?: string // 完整 URL
    rss?: string // 完整 URL 或 /-开头的路径
  }
}
```

## `ThemeColor`

```ts
interface ThemeColor {
  primary?: string // 默认 '#fb923c'
  secondary?: string // 默认 '#dc2626'
  bg?: string // 默认 '#1a0a00'
  surface?: string // 默认 '#2d1200'
}
```

## `HighlighterOptions`

```ts
interface HighlighterOptions {
  themeDark?: string // Shiki 主题，默认 'night-owl'
  themeLight?: string // Shiki 主题，默认 'vitesse-light'
  languages?: string[] // 额外语言，会与默认合并
  twoslash?: boolean // 启用 Twoslash TypeScript 悬浮信息
}
```

## `GiscusConfig`

```ts
interface GiscusConfig {
  repo: `${string}/${string}`
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
  reactionsEnabled?: boolean
  inputPosition?: 'top' | 'bottom'
  lang?: string
}
```

去 [giscus.app](https://giscus.app/) 获取这些字段。设置 `giscus` 后，每篇文章下方会自动渲染一个 `GiscusComments` 组件，主题切换（浅/深色）会自动同步。

## 环境变量

示例站点在构建时会读取两个环境变量：

| 变量 | 作用 |
|---|---|
| `BASE_PATH` | SvelteKit 的 `paths.base`。部署到子路径时设置。 |
| `SITE_URL` | 覆盖 `blogTheme()` 的 `base`，用于生成 OG/RSS 的绝对 URL。 |

主题本身不会读取这两个变量——它们通过你的 `svelte.config.js` 与 `vite.config.ts` 接入。
