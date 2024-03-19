---
title: Vite 插件
---

## 插件选项

@code(/../vite/src/types.ts,26,32)

### `siteConfig`

@code(/../vite/src/types.ts,9,12)

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

@code(/../vite/src/types.ts,13,25)

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

:::info[关于提供 Vite 插件选项]{icon=vscode-icons:file-type-vite}
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

:::important[插件顺序]{icon=solar:reorder-outline}
主题提供的 remark 以及 rehype 插件将会在 vite 插件提供的之前调用  
例如：
```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/* 默认主题选项 */),
      remarkPlugins: [/* 你的 remark 插件 */]
    })
  ]
})
```
yourRemarkPlugin 将会在默认主题中的 remark plugins 之后调用
:::

### `footnoteLabel`

自定义脚注标题，默认为：`"Footnotes"`

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

## 更低层级的 markdown API

@sveltepress/vite 包导出了一个名为 `mdToSvelte` 的更低层级的函数，它支撑了所有 Sveltepress 的 markdown 渲染

这个函数可以作为一些 Markdown 转换 Svelte 工具的基础，这是一个使用的示例

```ts
import { mdToSvelte } from '@sveltepress/vite'

const mdSource = `
---
title: Foo 
---
<script>
  const foo = 'bar'
</script>
# Title

foo in script is: {foo}

[Foo Link](https://foo.bar)
`

const { code, data } = await mdToSvelte({
  mdContent: mdSource,
  remarkPlugins: [], // 自定义 remark 插件
  rehypePlugins: [], // 自定义 rehype 插件
  highlighter: async (code, lang, meta) => Promise.resolve('高亮后的 HTML 结果'), // 自定义代码高亮函数
  filename: 'Foo.svelte', // 虚拟文件路径
})

// 渲染后的 Svelte 代码
code

// 解析后的 frontmatter 对象，这里是： { title: 'Foo' }
data
```

## Typescript

您需要在 src/app.d.ts 文件中包含 `@sveltepress/vite/types` 来获得相关的类型提示

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// Your other types
```
