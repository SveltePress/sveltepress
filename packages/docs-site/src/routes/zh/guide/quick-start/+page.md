---
title: 快速开始
---

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- Svelte 5、SvelteKit 2（`2.65.1` 及以上）或 SvelteKit 3，以及 Vite 8
- 推荐 pnpm 10；创建命令同时支持 npm、Yarn 和 Bun

## 创建一个项目

根据您所使用的包管理工具选择运行以下命令：

@install-pkg(@sveltepress@latest,create)

:::tip[pnpm 优先]
仓库与生成模板均使用 pnpm 10 验证。
:::

## 添加到一个已经存在的 Sveltekit 项目

### 安装 Vite 插件

@install-pkg(@sveltepress/vite)

### 在 vite.config.(js|ts) 中替换 `sveltekit` 插件

```ts title="vite.config.(js|ts)"
import { sveltekit } from '@sveltejs/kit/vite' // [svp! --]

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

### 通过 `sveltepress()` 传入 SvelteKit 配置

:::since[支持 SvelteKit 3]{version="2026-10-05" id="sveltekit-3" summary="Sveltepress 支持 SvelteKit 3。由于不再读取 svelte.config.js，SvelteKit 配置通过 svelteKitOptions 传入。"}
SvelteKit 3 不再读取 `svelte.config.js`，并且只要该文件存在就会拒绝启动。请将其中的配置（包括原来 `kit` 下的所有选项）移动到 `sveltepress({ svelteKitOptions })` 中，然后删除 `svelte.config.js`。Sveltepress 会自动帮你加上 `'.md'` 扩展名。

```ts title="vite.config.ts"
// @noErrors
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      svelteKitOptions: {
        preprocess: [vitePreprocess()],
        adapter: adapter({
          pages: 'dist',
        }),
      },
    }),
  ],
})
```
:::

:::tip[仍在使用 SvelteKit 2？]
SvelteKit 2 同样支持 `svelteKitOptions`。你也可以继续保留 `svelte.config.js`，并在其 `extensions` 中添加 `'.md'`：

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
:::

## 升级到 SvelteKit 3

1. 将 `@sveltejs/kit` 升级到 `^3.0.0`，并将 adapter 升级到其支持 SvelteKit 3 的版本，例如 `@sveltejs/adapter-static` `^4.0.0`。SvelteKit 3 需要 Node.js `>=22.17`。
2. 运行 `npx sv migrate sveltekit-3` 迁移你自己的代码，例如 `$app/stores`、`$app/paths` 中的 `base` 以及 `$lib` 导入。
3. 确保 SvelteKit 配置位于 `sveltepress({ svelteKitOptions })` 中（见上文）。迁移工具会把 `svelte.config.js` 移到 Vite 配置中的 `sveltekit(...)` 调用里：请把该对象移到 `svelteKitOptions` 中，并移除 `sveltekit(...)` 插件。

Sveltepress 本身无需其他改动。请注意：

- `$lib` 被 `#lib` 子路径导入取代。[版本管理](/guide/version-management/) 会像跟踪 `$lib/` 一样跟踪 `#lib/` 导入；如果你的 manifest 共享了 `$lib/**`，请同时在 `content.shared` 中添加 `#lib/**`。
- 默认主题的 [`pwa`](/guide/default-theme/pwa/) 选项依赖 `@vite-pwa/sveltekit`，而它暂不支持 SvelteKit 3。在 SvelteKit 3 下不会生成 service worker，构建时会输出警告。
