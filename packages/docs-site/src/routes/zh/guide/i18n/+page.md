---
title: 国际化（i18n）
---

SveltePress 可以在同一个站点中提供多种语言。国际化是可选的：不传 `locales` 时，站点保持单语言，行为与之前完全一致。

:::since[按需启用多语言]{version="2026-09-03" id="i18n-opt-in-locales" summary="通过 sveltepress({ locales }) 启用多语言路由、主题选项与语言切换器。"}
## 启用多语言

向 `sveltepress()` 传入 `locales` 映射。键是 URL 前缀（默认语言为 `/`，其余如 `/zh/`、`/bn/`）。每个条目需要 BCP 47 的 `lang`、语言切换器展示用的 `label`，以及该语言完整的主题选项：

```ts title="vite.config.ts"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'
import { locales } from './config/locales'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        // 各语言共享的站点级选项（logo、github、pwa 等）
      }),
      locales,
    }),
  ],
})
```

```ts title="config/locales.ts"
import type { LocalesConfig } from '@sveltepress/vite'
import navbar from './navbar'
import sidebar from './sidebar'
import zhI18n from './zh/i18n'
import zhNavbar from './zh/navbar'
import zhSidebar from './zh/sidebar'

export const locales: LocalesConfig = {
  '/': {
    lang: 'en',
    label: 'English',
    theme: { navbar, sidebar },
  },
  '/zh/': {
    lang: 'zh',
    label: '中文',
    theme: {
      navbar: zhNavbar,
      sidebar: zhSidebar,
      i18n: zhI18n,
    },
  },
}
```

未配置 `locales` 时，SveltePress 不会改写路径、不会渲染语言切换器，也不会扫描各语言路由树。
:::

:::since[语言路由与前缀]{version="2026-09-03" id="i18n-route-prefixes" summary="默认语言仍在 /；其他语言位于 /zh/、/bn/ 以及对应的 src/routes 目录。"}
## 路由与前缀

把翻译页面放在与默认语言相同的逻辑路由下：

```txt
src/routes/
├─ guide/introduction/+page.md          # 英文 → /guide/introduction/
├─ zh/guide/introduction/+page.md       # 中文 → /zh/guide/introduction/
└─ bn/guide/introduction/+page.md       # 孟加拉语 → /bn/guide/introduction/
```

默认语言保持无前缀的 `/`。其他语言使用各自配置的前缀（`/zh/`、`/bn/` 等）。各语言的逻辑路径一致，只有前缀不同。
:::

:::since[语言切换器与回退]{version="2026-09-03" id="i18n-language-switcher" summary="默认主题切换器会尽量保留逻辑页面，并支持版本化回退。"}
## 语言切换器与回退

配置 `locales` 后，默认主题会在导航栏渲染语言切换器。目标语言存在同一逻辑页面时会保留该页面。若当前位于历史版本页面（`/v/<id>/…` 或 `/zh/v/<id>/…`），而目标语言没有对应冻结页面，则会优先回退到该语言当前版的同一逻辑页面；再不行则打开该语言首页，并显示简短提示（`svp-locale-fallback=1`）。

可通过主题 `i18n.localeSwitcher` 与 `i18n.localePageUnavailable` 自定义切换器与提示文案。
:::

:::since[virtual:sveltepress/locale]{version="2026-09-03" id="i18n-virtual-locale" summary="客户端辅助函数用于解析当前语言、本地化链接并计算切换目标。"}
## `virtual:sveltepress/locale`

主题与自定义布局可从该虚拟模块导入语言相关辅助函数：

```ts
import {
  locales,
  resolveLocale,
  resolveLocalizedPath,
  resolveLocaleSwitch,
} from 'virtual:sveltepress/locale'

const active = resolveLocale('/zh/guide/introduction/')
const href = resolveLocalizedPath('/guide/quick-start/', active)
const target = resolveLocaleSwitch('/zh/guide/introduction/', '/')
```

* `locales` — 已配置的映射；未启用 i18n 时为 `null`
* `resolveLocale(pathname)` — 当前语言（`lang`、`label`、`prefix`、`theme` 等）
* `resolveLocalizedPath(to, locale)` — 将内部链接改写到当前语言
* `resolveLocaleSwitch(pathname, targetPrefix)` — 切换器用的 `{ href, fallback }`
:::

:::since[createLocaleHandle]{version="2026-09-03" id="i18n-create-locale-handle" summary="SSR 钩子在水合前根据当前语言设置 <html lang>。"}
## SSR `<html lang>`

使用 `@sveltepress/vite/hooks` 中的 `createLocaleHandle`，让首屏 HTML 带上正确的语言属性，方便爬虫与辅助技术。默认主题会在客户端路由切换后同步 `document.documentElement.lang`。

```js title="src/hooks.server.js"
import { createLocaleHandle } from '@sveltepress/vite/hooks'
import { locales } from '../config/locales'

export const handle = createLocaleHandle(locales)
```
:::

:::since[按语言的 llms 与 hreflang sitemap]{version="2026-09-03" id="i18n-llms-sitemap" summary="每种语言有独立的 llms 索引；sitemap 为各语言与历史版本列出 hreflang。"}
## 按语言的 llms 与 sitemap

启用 `llms` 后，生产构建会写入按语言划分的 `llms.txt` / `llms-full.txt`（例如 `/llms.txt` 与 `/zh/llms.txt`），只列出该语言页面及带前缀的 URL。历史索引写在各语言的版本基路径下（`/v/<id>/`、`/zh/v/<id>/` 等）。

`sitemap.xml` 会列出每种语言的当前页面，并为共享同一逻辑路由的语言生成 hreflang 备用地址，同时包含各语言清单中符合条件的历史版本 URL。EOL 历史默认排除，除非该版本设置 `noIndex: false`。
:::

:::since[按语言的文档版本管理]{version="2026-09-03" id="i18n-locale-versioning" summary="每种语言有独立的版本清单；CLI --locale 选择 sveltepress.versions.<locale>.json。"}
## 按语言的文档版本管理

每种语言可以维护自己的文档版本清单：

| 语言 | 清单文件 | 版本基路径 |
| --- | --- | --- |
| 默认（`/`） | `sveltepress.versions.json` | `/v` |
| `zh` | `sveltepress.versions.zh.json` | `/zh/v` |
| `bn` | `sveltepress.versions.bn.json` | `/bn/v` |

非默认语言请在 versions 相关 CLI 子命令上增加 `--locale <id>`（例如 `zh`、`bn`），以选择 `sveltepress.versions.<locale>.json`：

```sh
sveltepress versions build --locale zh
sveltepress versions create 8.2 --label "8.2" --locale zh
sveltepress versions validate --locale zh
```

`init --locale zh` 默认使用基路径 `/zh/v`；增量源码位于 `version-deltas-zh/`（或清单中的 `artifacts.sources`）。完整发版流程见[文档版本管理](/guide/version-management/)。
:::

## 按语言的搜索

本地搜索会按 `<html lang="…">` 过滤。DocSearch 与自定义搜索应通过各语言主题选项配置独立索引。细节与版本相关行为见[搜索](/guide/default-theme/search/)。
