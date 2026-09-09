---
title: 'virtual:sveltepress/versions'
versionChanges:
  exclude: true
---

当在 `@sveltepress/vite` 中启用文档版本管理时，`virtual:sveltepress/versions` 虚拟模块提供了对版本清单、路由辅助函数、发布变化总览以及版本运行时的访问。

自定义主题和组件可以通过导入该模块来构建版本切换器、生命周期提示横幅、更新日志列表以及具备版本感知能力的站内链接。

## 实时数据

以下是当前站点版本运行时数据的实时交互展示：

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import versions from 'virtual:sveltepress/versions'
</script>

<div class="viewer">
  <JsonViewer data={versions} />
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

### `manifest`

* **类型**：`VersionManifest | null`

默认语言（`'/'`）的版本清单。如果未启用文档版本管理或不存在清单，则为 `null`。

### `manifests`

* **类型**：`Record<string, VersionManifest | null>`

以语言前缀（如 `'/'`、`'/zh/'`、`'/bn/'`）为键的版本清单字典。在单语言站点中，包含 `{ '/': manifest }`。

### `changeSets`

* **类型**：`Record<string, VersionChangeSet>`

以版本 ID 为键的发布变更集字典。每个条目包含相对于其基线历史版本的 `newPages`（新增页面）和 `updatedPages`（更新页面）。

### `resolveVersionManifest`

* **类型**：`(pathname: string) => VersionManifest | null`

根据给定路径的语言前缀解析对应的 `VersionManifest`。

### `resolveVersionChanges`

* **类型**：`(versionId?: string, pathname?: string) => VersionChangeSet | null`

返回指定 `versionId` 的变更集。如果省略，则返回当前版本的变更集。在多语言站点中，可选参数 `pathname` 用于选择对应语言的清单。

### `resolveVersionContext`

* **类型**：`(pathname: string) => VersionContext | null`

解析 URL 路径的 `VersionContext`，包含：
* `versionId`：当前激活的版本 ID（例如当前版本或某个历史版本 ID）。
* `version`：对应的 `DocumentationVersion` 配置对象。
* `logicalPath`：去除了版本和语言前缀的规范路由路径。
* `historical`：`boolean`，指示该路由是否属于冻结的历史版本。
* `basePath`：版本基础路径（例如 `'/v'` 或 `'/zh/v'`）。
* `manifest`：解析出的 `VersionManifest` 实例。

### `resolveVersionedPath`

* **类型**：`(to: string, context: VersionContext | null) => string`

在历史版本上下文中解析站内链接目标。如果目标路由存在于该历史版本快照中，则返回带有版本前缀的链接；否则返回原始路径。

### `resolveVersionSwitch`

* **类型**：`(pathname: string, targetVersionId: string) => VersionSwitchTarget | null`

计算从 `pathname` 切换到目标版本 `targetVersionId` 时的跳转目标。返回 `{ href, fallback }`，如果目标版本中不存在该页面且回退到了该版本的主页，则 `fallback` 为 `true`。

### `default`

* **类型**：`VersionRuntime`

默认导出即版本运行时对象本身，汇集了所有辅助函数以及 `manifest`、`manifests` 和 `changeSets`。

## 与 TypeScript 一起开发

在 `src/app.d.ts` 中引入 `@sveltepress/vite/types`，即可获得 `virtual:sveltepress/versions` 的完整类型提示：

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// 其它类型
```
