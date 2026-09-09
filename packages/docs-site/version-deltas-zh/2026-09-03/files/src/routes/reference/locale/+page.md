---
title: 'virtual:sveltepress/locale'
versionChanges:
  exclude: true
---

当在 `@sveltepress/vite` 中通过 `locales` 选项启用多语言支持时，`virtual:sveltepress/locale` 模块提供了已解析的多语言配置、路由语言解析、链接本地化辅助函数以及语言切换目标计算。

自定义主题和组件可以通过导入该模块来构建语言切换器、本地化链接以及具备语言感知能力的用户界面。

## 实时数据

以下是当前站点 `locales` 配置数据的实时交互展示：

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import { locales } from 'virtual:sveltepress/locale'
</script>

<div class="viewer">
  <JsonViewer data={locales} />
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

### `locales`

* **类型**：`LocalesConfig | null`

以路由前缀（如 `'/'`、`'/zh/'`、`'/bn/'`）为键的多语言配置字典。在单语言站点中，该值为 `null`。

### `resolveLocale`

* **类型**：`(pathname: string, base?: string) => ResolvedLocale | null`

根据给定的 URL 路径解析出激活的 `ResolvedLocale` 对象，包含：
* `prefix`：路由前缀（例如 `'/'`、`'/zh/'` 或 `'/bn/'`）。
* `lang`：BCP 47 语言代码（例如 `'en'`、`'zh-CN'`、`'bn'`）。
* `label`：展示给用户的语言名称（例如 `'English'`、`'简体中文'`、`'বাংলা'`）。
* `title`：该语言下的可选站点标题覆盖。
* `description`：该语言下的可选站点描述覆盖。
* `theme`：该语言下的主题配置选项。

### `resolveLocalizedPath`

* **类型**：`(to: string, locale: ResolvedLocale | null, base?: string) => string`

为站内相对路径添加指定语言的前缀。外链和已包含正确前缀的链接将保持不变。

### `resolveLocaleSwitch`

* **类型**：`(pathname: string, targetPrefix: string, base?: string) => LocaleSwitchTarget | null`

计算从当前 `pathname` 切换到目标语言前缀 `targetPrefix` 时的目标路径。返回 `{ href, fallback }`，如果目标语言中不存在该页面并回退到了对应主页，则 `fallback` 为 `true`。

### `default`

* **类型**：`LocaleRuntime`

默认导出的语言运行时对象，汇集了 `locales`、`resolveLocale`、`resolveLocalizedPath` 和 `resolveLocaleSwitch`。

## 与 TypeScript 一起开发

在 `src/app.d.ts` 中引入 `@sveltepress/vite/types`，即可获得 `virtual:sveltepress/locale` 的完整类型提示：

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// 其它类型
```
