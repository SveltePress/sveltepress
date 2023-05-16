---
title: PWA
---

## 介绍

此特性集成了 [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin)

传递 `pwa` 选项给默认主题来使用 PWA，该选项与 [SvelteKit PWA Plugin Options](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin-options) 完全一致，并新增了 `darkManifest`，可以用来配置夜间模式下的 manifest 文件

:::note[依赖需要]
需要安装 `workbox-window` 来使得 PWA 功能正确工作

@install-pkg(workbox-window)

:::


## 配置示例

用此站点使用的配置来举例：

@code(/vite.config.ts,141,177)