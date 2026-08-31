---
title: 主页
---

## Frontmatter

`src/routes/+page.(md|svelte)` 文件将会被当作主页

用当前站点使用的主页配置举例：

@code(../../../+page.md)

您可以在[本站的首页](/)看到效果

### `heroImage`

首页的大 Logo 图片，推荐使用质量较高的图片。如果落地页需要把完整宽度留给正文、不显示默认 Hero 插图，可设置为 `false`。

:::since[本地化默认 Hero 视觉]{version="2026-08-31" id="hero-code-localization" summary="通过 i18n.heroCode 本地化默认双面板 Hero 预览。"}
省略 `heroImage` 时，默认主题会显示双面板代码预览。可以通过主题的 `i18n.heroCode` 配置本地化其中的文字：

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  i18n: {
    heroCode: {
      title: '你好',
      messageBefore: '在 ',
      messageStrong: 'Markdown',
      messageAfter: ' 中使用 Svelte',
      tipLabel: '提示',
      counterLabel: '计数：1',
    },
  },
})
```

`messageBefore`、`messageStrong` 和 `messageAfter` 会组合成源码面板中的 Markdown 句子；`tipLabel` 和 `counterLabel` 用于自定义渲染结果面板。
:::

### `tagline`

在标题以及描述之下的补充文字

### `actions`

动作按钮，每个按钮包含如下几个属性：
* `label`
  按钮里的文案
* `to`
  按钮的链接
* `external`
  是否展示外部链接的图标

### `features`

特性卡片

* `title`
  标题
* `description`
  描述
* `icon`
自定义卡片图标
  * `type` - `'svg' 或者 'iconify'`
  * `value` - svg 的 DOM 内容
  * `collection` - Iconfiy 分类名称
  * `name` - Iconfiy 分类下的图标名称
* `link`
  点击特性卡片跳转的链接地址
  当提供此项时特性卡片将会具有一个可点击的交互样式
  以 http(s) 开头的链接将会被自动识别为外部链接，将会在卡片右上角出现一个外部图标

:::important[图标需要预构建]{icon=tabler:icons}
用到的图标需要加入 [iconify 预构建配置](/reference/default-theme/#preBuildIconifyIcons) 中
:::

### `home`

根路由默认使用首页布局。其他路由可以设置 `home: true`，复用相同的落地页展示形式，并使用该页面自己的 `title`、`description` 和 `tagline`。落地页不会展示文档侧边栏、页内目录、编辑元信息和上一篇/下一篇切换。

在根路由设置 `home: false` 可以移除默认首页内容，通常用于完全自定义首页。

## 插槽

### `hero-image`

设置一个自定义的首页大 Logo 内容，比如：

```svelte title="/src/routes/+page.(md|svelte)"
{#snippet heroImage()}
  <div>
    自定义 Logo 内容
  </div>
{/snippet}
```
