---
title: 快速开始
---

## 创建一个项目

根据您所使用的包管理工具选择运行以下命令：

@install-pkg(@sveltepress@latest,create)

:::tip[pnpm 优先]
如果可能的话请尽可能使用 pnpm. Pnpm 更加尊重您项目所使用的依赖版本
:::

## 添加到一个已经存在的 Sveltekit 项目

### 安装 Vite 插件

@install-pkg(@sveltepress/vite)

### 在 vite.config.(js|ts) 中替换 `sveltekit` 插件

```ts title="vite.config.(js|ts)"
import { sveltekit } from '@sveltejs/kit' // [svp! --]

import { sveltepress } from '@sveltepress/vite' // [svp! ++]

// @noErrors
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltekit(), // [svp! --]
    sveltepress(), // [svp! ++]
  ],
})

export default config
```

:::warning[请移除原来的 `sveltekit()` 插件]
`sveltepress()` 已经为你配置好了 SvelteKit。如果在 `plugins` 中同时保留 `sveltekit()` 和 `sveltepress()`，每个 Svelte 文件都会被编译两次，导致开发服务器崩溃并报错 `Expected token }`。
:::

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

:::tip[没有 `svelte.config.js`？（较新的 SvelteKit 项目结构）]
使用较新的 `npx sv create` 创建的项目会把 SvelteKit 配置直接内联写在 `vite.config.ts` 中，且不再包含 `svelte.config.js`。请将这些配置移动到 `sveltepress({ svelteKitOptions })` 中（Sveltepress 会自动帮你加上 `'.md'` 扩展名），并移除单独的 `sveltekit()` 插件：

```ts title="vite.config.ts"
// @noErrors
import adapter from '@sveltejs/adapter-auto'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      svelteKitOptions: {
        compilerOptions: {
          runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
        },
        adapter: adapter(),
      },
    }),
  ],
})
```
:::
