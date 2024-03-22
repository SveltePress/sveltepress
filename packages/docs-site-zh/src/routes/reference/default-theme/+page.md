---
title: Default theme
---

## 安装

@install-pkg(@sveltepress/theme-default)

### 在 vite.config.(js|ts) 中配置

```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'

import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltepress({/** 配置 */}), // [svp! --]
    sveltepress({ // [svp! ++]
      theme: defaultTheme(/** 主题配置 */) // [svp! ++]
    }) // [svp! ++]
  ],
})

export default config
```

## 主题配置

### 类型一览

<Expansion title="类型一览">

@code(/../theme-default/types.d.ts)

</Expansion>


### `navbar`

* `title`  
  标题
* `to`  
  链接地址
* `icon`
  自定义展示 HTML 内容，通常用于展示自定义图标内容
* `external`  
  如果设置为 `true`，将会展示一个标记外部链接的图标
* `items`  
  子项，如果配置会展示下拉导航

### `discord`
Discord 链接，如果提供将会展示一个 Discord 图标

### `github`
GitHub 仓库链接，如果提供将会展示一个 GitHub 图标

### `logo`

Logo 图片 

### `sidebar`

一个对象，键为分组路由前缀，值为包含如下属性的对象数组

* `title`  
  组标题
* `collapsible`  
  组是否可折叠
* `to`  
  链接地址
* `items`  
  子链接，若配置该属性，则 `to` 将会失效，展示一个分组链接

### `highlighter`

一个包含如下属性的代码块高亮相关配置：

* `languages` - 自定义支持的语言列表，默认为：`['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']`
* `themeLight` - 日间模式所使用的高亮主题，默认为：`vitesse-light`
* `darkTheme` - 夜间模式所使用的高亮主题，默认为：`night-owl`
* `twoslash` - 设置为 `true` 可以开启 [Twoslash](/guide/default-theme/twoslash/) 功能. 默认为 `false`

:::important[TIP]
你可以在 [Shiki Repo](https://github.com/shikijs/shiki) 获得所有支持的语言以及主题
:::

### `editLink`

页面底部展示的“在 Github” 上编辑此页的链接，例如该站点使用的配置为：`https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route`

`:route` 代表路由，例如 src/routes/foo/bar/+page.md => /foo/bar

### `ga`

提供自 [Google Analytics](https://analytics.google.com/)，形如 `G-XXXXXXX`

配置该项将会自动添加 gtag 相关脚本

### `docsearch`

* appId
* apiKey
* indexName

阅读 [Docsearch](https://docsearch.algolia.com/) 来获得更多信息

### `pwa`

阅读 [PWA 章节](/guide/default-theme/pwa/) 来获得更多信息

### `themeColor`

主题色相关

* `light` - 日间模式主题色，也会应用在 pwa 顶部窗口导航
* `dark` - 夜间模式主题色，也会应用在 pwa 顶部窗口导航
* `gradient` - 全站使用到的渐变色，如：首页标题，首页按钮，链接高亮文字
```js
const defaultGradient = {
  start: '#fa709a',
  end: '#fee140',
}
```
* `primary` - 站点主色
* `hover` - 鼠标上浮时主色

### `i18n`

一些固定的文本内容，可以被您的配置所覆盖，方便站点国际化

* `onThisPage` - "On this page"
* `suggestChangesToThisPage` - "Suggest changes to this page"
* `lastUpdateAt` - "Last update at:"
* `previousPage` - "Previous"
* `nextPage` - "Next"
* `expansionTitle` - 在 Markdown 以及 Svelte 可折叠代码块上的折叠面板标题："Click to expand/fold code"
* `pwa` - PWA 提示弹窗中的文本，下面的每个字段都直接对应到弹窗中对应意义的文本 
  * `tip`
  * `reload`
  * `close`
  * `appReadyToWorkOffline`
  * `newContentAvailable`
* `footnoteLabel` - 自动生成的脚注标题，默认为 `"Footnotes"`

### `preBuildIconifyIcons`
一些你可能在编写文档过程中用到的 [Iconify](https://iconify.design/) 图标

为一个对象，键是分类名称，值是该分类下需要预构建的图标集合，下面是此站点的配置

@code(/vite.config.ts,29,41)

这些图标看起来像这样：
```svelte live
<script lang="ts">
  import { IconifyIcon } from '@sveltepress/theme-default/components'
  import themeOptions from 'virtual:sveltepress/theme-default'
</script>
<div class="flex items-center gap-4 text-[48px] flex-wrap">
  {#each Object.entries(themeOptions.preBuildIconifyIcons || []) as [collection, names]}
    {#each names as name}
      <div>
        <IconifyIcon {collection} {name} />
      </div>
    {/each}
  {/each}
</div>
```

## 全局上下文

全局上下文的键在模块 `@sveltepress/theme-default/context` 中，你可以通过 [`getContext`](https://svelte.dev/docs/svelte#getcontext) API 来获取所有的上下文，下面是一个示例：

```svelte live
<script lang="ts">
  import { getContext } from 'svelte'
  import { SVELTEPRESS_CONTEXT_KEY } from '@sveltepress/theme-default/context'
  import type { SveltepressContext } from '@sveltepress/theme-default/context'

  const { isDark } = getContext<SveltepressContext>(SVELTEPRESS_CONTEXT_KEY)
</script>

<div class:dark-text="{$isDark}" class="text-10">
  isDark: {$isDark}
</div>
<style>
  .dark-text {
    --at-apply: 'text-red';
  }
</style>
```

上下文属性一览：

* `$isDark` - 用来表示当前的主题是否为暗色，是一个响应式的 [svelte store](https://svelte.dev/docs/svelte-store)

## 虚拟模块

### `virtual:sveltepress/theme-default`

这个模块默认导出所有传递给 `defaultTheme()` 函数的选项

这是当前站点所使用的配置：

```svelte live
<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
</script>
<div class="viewer">
  <pre>
    {JSON.stringify(themeOptions, null, 2)}
  </pre>
</div>
<style>
  .viewer {
    max-height: 40vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
```

## Typescript

您需要在 src/app.d.ts 文件中添加 `@sveltepress/theme-default/types` 来获得默认主题相关类型提示

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/theme-default/types" />

// Your other types
```
