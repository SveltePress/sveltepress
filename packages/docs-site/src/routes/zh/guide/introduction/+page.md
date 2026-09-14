---
title: 介绍
---

Sveltepress 是面向文档与博客的 SvelteKit 站点构建工具。
启发自 [VitePress](https://vitepress.dev/)。
基于 [SvelteKit](https://kit.svelte.dev/) 与 [UnoCSS](https://github.com/unocss/unocss) 构建 —— 既有内容工具链，也保留 SSR、适配器、服务端路由与 hooks 等完整能力。

导航栏中的 **演练场** 会打开浏览器内的功能目录与 Starter。Markdown、默认主题与 Vite 插件条目共用默认主题 Starter。「文档版本管理」使用 Versions Starter（`versions init` / `create` · `versions build`）。「国际化」使用双语言 Starter。「自定义主题」仅能从演练场首页进入（没有对应指南页）。博客主题条目（配置、写文章、特性、自定义）共用 Blog starter。「虚拟模块」是 Kitchen-sink Starter 上的一条参考条目；在 `virtual:sveltepress/site`、`locale` 与 `versions` 页上的 Open in Playground 都会进入该条目。Kitchen sink 是「全部特性」条目，也是演练场顶部的 CTA（不是站点导航栏项）。博客主题和自定义主题不会进入该树。指南页仍使用不可编辑的 Live code；博客示例仍是成品展示。

## 项目结构

与 [项目结构 - SvelteKit](https://kit.svelte.dev/docs/project-structure) 完全一致
除此外，您还可以使用 .md 文件作为页面（+page）或者布局（+layout）

例如：
* `src/routes/+page.md` 将会被用作首页
* `src/routes/+layout.md` 将会被用作自定义全局布局

:::tip[SvelteKit 的完整能力]{icon=logos:svelte-kit}
Sveltepress 保留了 SvelteKit 的完整能力，你可以做的远不止静态站点构建
比如使用 +page.server.js, +layout.server.js, hooks.server.js 去做一些像鉴权，认证，数据库对接等功能
:::

## 布局层级

:::note[根布局文件是必须的]{icon=ph:layout-duotone}
必须有一个 `src/routes/+layout.svelte` 或者 `src/routes/+layout.md` 作为根布局组件
**否则由主题提供的全局布局将不会工作！**
:::

假设你有一个这样的文件树：

```txt
.
├─ src
│  ├─ routes
│  │  └─ +layout.(svelte|md)
│  │  ├─ foo
│  │  │  ├─ +page.(svelte|md)
│  │  │  ├─ +layout.(svelte|md)
```

`theme.globalLayout` > `src/routes/+layout.(svelte|md)` > `theme.pageLayout` > `src/routes/foo/+layout.(md|svelte)` > `src/routes/foo/+page.md`

这里有一个图表帮助你理解：

<script>
  import LayoutHierarchy from '$lib/components/LayoutHierarchy.svelte'
</script>

<LayoutHierarchy />

## 配置

配置项传递给 @sveltepress/vite 插件，你可以阅读[Vite 插件选项 - 参考](/reference/vite-plugin/) 来获得更多信息

:::since[国际化指南]{version="2026-09-03" id="intro-link-i18n" summary="链向新的多语言指南。"}
需要多语言站点？请阅读[国际化](/guide/i18n/)。
:::

## 部署

推荐先阅读 [适配器 - SvelteKit](https://kit.svelte.dev/docs/adapters) 章节
如果您使用了 `npm/yarn/pnpm create @sveltepress` 来创建一个新的项目
[静态适配器](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) 将会被默认使用

您可以根据需要换成任何想要的适配器
