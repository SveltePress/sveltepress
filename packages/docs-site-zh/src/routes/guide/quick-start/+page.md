---
title: 快速开始
---

## 创建一个项目

根据您所使用的包管理工具选择运行以下命令：

@install-pkg(@sveltepress,create)

:::tip[pnpm 优先]
如果可能的话请尽可能使用 pnpm. Pnpm 更加尊重您项目所使用的依赖版本
:::

## 添加到一个已经存在的 Sveltekit 项目

### 安装 Vite 插件

@install-pkg(@sveltepress/vite)

### 在 vite.config.(js|ts) 中替换 `sveltekit` 插件

```ts title="vite.config.(js|ts)"
// @noErrors
import { defineConfig } from 'vite'

import { sveltekit } from '@sveltejs/kit' // [svp! --]

import { sveltepress } from '@sveltepress/vite' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltekit(), // [svp! --]
    sveltepress(), // [svp! ++]
  ],
})

export default config
```

### 在 svelte.config.js 中添加 `'.md'` 到 `extensions` 选项

```ts title="svelte.config.js"
// @noErrors
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  extensions: ['.svelte'], // [svp! --]
  extensions: ['.svelte', '.md'], // add .md here // [svp! ++]
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
    }),
  },
}

export default config
```