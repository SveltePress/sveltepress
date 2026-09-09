---
title: 'virtual:sveltepress/site'
versionChanges:
  exclude: true
---

`virtual:sveltepress/site` 虚拟模块导出了在 `sveltepress({ siteConfig })` 中配置的核心站点元数据（`title`、`description`）。

自定义主题、全局组件或布局模板可以导入该模块来展示全局站点名称与描述，或者填充 HTML meta 标签。

## 实时数据

以下是当前站点 `siteConfig` 配置数据的实时交互展示：

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import siteConfig from 'virtual:sveltepress/site'
</script>

<div class="viewer">
  <JsonViewer data={siteConfig} />
</div>
<style>
  .viewer {
    max-height: 40vh;
    overflow: auto;
  }
  :global(html.dark) .viewer {
    --discovery-background-color: #1a1a1a;
    --sjd-app-bg: #1a1a1a;
    --sjd-fmt-color: #999;
    --sjd-fmt-hover-color: #aaa;
    --sjd-fmt-property-color: #d17a8c;
    --sjd-fmt-number-color: #0f8dc2;
    --sjd-fmt-atom-color: #0f8dc2;
    --sjd-fmt-string-color: #7faf20;
    --sjd-fmt-string-underline-color: #85ab51;
    --sjd-fmt-string-hover-color: #97cf26;
    --sjd-ui-color: #ccc;
    --sjd-match-bg: #565638;
    --sjd-match-border: #a7a73b;
    --sjd-error-border: #0004;
    --sjd-error-bg: #622b29;
    --sjd-error-color: #c66;
    --sjd-error-message-bg: #443232;
    --sjd-toggle-color: #72b372;
    --sjd-touch-button-color: #aaa;
    --sjd-touch-button-bg: #50505080;
    --sjd-popup-bg: #333;
    --sjd-popup-color: #ccc;
    --sjd-popup-notes-color: #999;
    --sjd-popup-error-color: #e66;
    color-scheme: dark;
  }
</style>
```

## 模块导出

### `default`

* **类型**：`{ title: string, description: string }`

默认导出即为站点元配置对象：

* `title`：在 `siteConfig.title` 中配置的站点标题。若未提供，默认为 `'Untitled site'`。
* `description`：在 `siteConfig.description` 中配置的站点描述。若未提供，默认为 `'Build by sveltepress'`。

## 与 TypeScript 一起开发

在 `src/app.d.ts` 中引入 `@sveltepress/vite/types`，即可获得 `virtual:sveltepress/site` 的完整类型提示：

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// 其它类型
```
