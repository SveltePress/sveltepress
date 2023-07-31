---
title: 介绍
---

Sveltepress 是一个以内容（Markdown）为中心的站点构建工具  
启发自 [Vitepress](https://vitepress.vuejs.org/).  
基于 [SvelteKit](https://kit.svelte.dev/), [Unocss](https://github.com/unocss/unocss) 等构建

## 项目结构

与 [项目结构 - SvelteKit](https://kit.svelte.dev/docs/project-structure) 完全一致  
除此外，您还可以使用 .md 文件作为页面（+page）或者布局（+layout）

例如：
* `src/routes/+page.md` 将会被用作首页
* `src/routes/+layout.md` 将会被用作自定义全局布局

:::tip[Sveltekit 的完整能力]{icon=logos:svelte-kit}
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

<img src="/layout-hierarchy.png" style="width:100%;" alt="" />

## 配置

配置项传递给 @sveltepress/vite 插件，你可以阅读[Vite 插件选项 - 参考](/reference/vite-plugin/) 来获得更多信息

## 部署

推荐先阅读 [适配器 - SvelteKit](https://kit.svelte.dev/docs/adapters) 章节    
如果您使用了 `npm/yarn/pnpm create @sveltepress` 来创建一个新的项目
[静态适配器](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) 将会被默认使用

您可以根据需要换成任何想要的适配器

