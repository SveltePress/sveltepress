---
title: Vite 插件
---

## 插件选项

@code(/../vite/src/types.ts,21,27)

### `siteConfig`

@code(/../vite/src/types.ts,8,11)

* `title`: 站点标题，默认为：`'Untitled site'`
* `description`: 站点描述，默认为：`'Build by sveltepress'`

### `addInspect`

如果设置为 `true`，将会添加 [Vite plugin inspect](https://github.com/antfu/vite-plugin-inspect)  

### `theme`

查看下方 [ResolvedTheme](#ResolvedTheme)

### `remarkPlugins`

阅读 [Remark plugins](https://github.com/remarkjs/remark#plugins) 来获得更多信息

### `rehypePlugins`  

阅读 [Rehype plugins](https://github.com/rehypejs/rehype#plugins) 来获得更多信息

## `ResolvedTheme`

@code(/../vite/src/types.ts,12,20)

### `name`   

主题名称

### `globalLayout`  

全局布局文件的绝对路径， **应当为一个 svelte 文件**  
例如：`path.resolve(process.cwd(), 'ThemeGlobalLayout.svelte')`

### `pageLayout`  

页面布局文件的绝对路径， **应当为一个 svelte 文件**  
例如：`path.resolve(process.cwd(), 'ThemePageLayout.svelte')`
  
### `vitePlugins`  

* 如果传递了一个单一插件或者一组插件，这些插件将会在 `sveltepress` 核心插件之前被注册
* 如果传递了一个函数，将会接受 `sveltepress` 插件作为入参，并且该函数需要返回插件组，您可以通过此方式来自定义插件顺序

:::info[关于提供 Vite 插件选项]
  也许这种行为显得比较奇怪，但是当主题需要添加一些自定义[虚拟模块](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention)时会很有用
:::

### `highlighter`  

代码高亮渲染函数
例如，默认主题使用了 [shiki](https://github.com/shikijs/shiki).  
阅读 [默认主题源代码](https://github.com/Blackman99/sveltepress/blob/256c1abe6be51d37fa1ff5f9148368207c47a7ae/packages/theme-default/src/markdown/highlighter.ts) 来查看具体用法

### `remarkPlugins`  

阅读 [Remark plugins](https://github.com/remarkjs/remark#plugins) 来获得更多信息

### `rehypePlugins`  

阅读 [Rehype plugins](https://github.com/rehypejs/rehype#plugins) 来获得更多信息

:::important[插件顺序]
主题提供的 remark 以及 rehype 插件将会在 vite 插件提供的之前调用  
例如：
```js title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/* theme options */),
      remarkPlugins: [yourRemarkPlugin]
    })
  ]
})
```
yourRemarkPlugin 将会在默认主题中的 remark plugins 之后调用
:::

## 虚拟模块

### `virtual:sveltepress/site`

这个模块默认导出 `siteConfig`，示例：

```svelte live
<script>
  import siteConfig from 'virtual:sveltepress/site'
</script>

<p>站点标题为：{siteConfig.title}</p>
<p>站点描述：{siteConfig.description}</p>
```

## Typescript

您需要在 src/app.d.ts 文件中包含 `@sveltepress/vite/types` 来获得相关的类型提示

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// Your other types
```
