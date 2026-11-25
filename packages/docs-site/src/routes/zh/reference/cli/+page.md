---
title: Sveltepress CLI
versionChanges:
  exclude: true
---

`@sveltepress/cli` 提供了 `sveltepress` 命令行工具，用于管理文档版本、版本清单、不可变源码增量以及增量构建产物。

## 安装

```sh
pnpm add -D @sveltepress/cli
```

## 语法概要

```sh
sveltepress versions <command> [options]
```

## 子命令详解

### `init`

初始化版本清单文件（`sveltepress.versions.json`）：

```sh
sveltepress versions init --current 1.0 --label "1.0"
```

* `--current <id>`：当前版本的标识符，必填。
* `--label <label>`：当前版本的显示名称（默认与标识符相同）。
* `--base-path <path>`：历史路由的基础前缀（默认为 `'/v'`；指定 `--locale` 时为 `'/<locale>/v'`）。
* `--locale <id>`：目标语言（如 `zh`、`bn`）。会生成 `sveltepress.versions.<locale>.json`。

### `create`

冻结当前正在使用的版本，并开启一个新的当前版本：

```sh
sveltepress versions create 1.1 --label "1.1"
```

假设当前版本是 `1.0`：这条命令会把 `1.0` 按它已有的标识符和显示名称冻结为不可变的历史版本，并让 `1.1` 成为新的当前版本。

* `<version-id>`：**新的当前版本**的标识符，不能与已有版本重复。
* `--label <label>`：新的当前版本的显示名称（默认为 `<version-id>`）。
* `--locale <id>`：仅冻结指定语言的版本清单。
* `--allow-dirty`：允许在 Git 工作区存在未提交更改时执行。

### `list`

列出清单中已注册的所有文档版本及其生命周期状态：

```sh
sveltepress versions list
sveltepress versions list --locale zh
```

* `--locale <id>`：目标语言。

### `validate`

校验清单格式、发布变更目录、页面产物完整性与增量一致性：

```sh
sveltepress versions validate
sveltepress versions validate --locale zh
```

* `--locale <id>`：目标语言。

:::since[只对当前树跑 Vite]{version="2026-09-17" id="versions-cli-overlay-plan" summary="versions plan 报告 overlay 数量；versions build 只预渲染当前树，再覆盖写入冻结的 /v/ HTML。"}
`versions plan` 的 JSON 包含 `vitePrerenderScope: "current-only"` 与 `overlaidHistoricalHtml`。未指定 `--locale` 时，`versions build` 只预渲染当前语言树，再把冻结的 `/v/` HTML 覆盖进同一份产物。
:::

### `plan`

预览增量构建计划，查看页面复用、变更路由、overlay 数量以及失效原因。JSON 中包含 `vitePrerenderScope: "current-only"` 与 `overlaidHistoricalHtml`。

```sh
sveltepress versions plan
```

* `--locale <id>`：目标语言。

### `build`

执行支持版本管理的生产编译。未指定 `--locale` 时，会为每种语言生成草稿，只对当前语言树跑 Vite，再把冻结的 `/v/` HTML 覆盖进同一份产物：

```sh
sveltepress versions build
sveltepress versions build --locale zh
```

* `--locale <id>`：仅编译指定语言。
* `--draft-only`：仅生成草稿产物，不进行最终合成。

### `compose`

将预编译的页面产物合成为最终的站点生产输出目录：

```sh
sveltepress versions compose
```

* `--locale <id>`：目标语言。

### `publish`

输出一个已冻结版本的标识信息，例如用于在 CI 中记录。它只读取产物存储，不会修改任何内容：

```sh
sveltepress versions publish 1.0
```

输出为 JSON，包含 `siteId`、`versionId`、`manifestHash` 以及页面数量 `pages`。

* `<version-id>`：版本清单中一个已冻结的版本。
* `--locale <id>`：目标语言。

:::note[生命周期状态]
目前还没有子命令可以修改已冻结版本的 `status` 或 `message`。版本清单现在接受哪些写法，见[版本管理](/guide/version-management/)。
:::

### `migrate`

将旧版本元数据迁移到基于内容寻址的增量产物存储：

```sh
sveltepress versions migrate --site-id my-docs
```

* `--site-id <id>`：产物存储的站点标识符。
* `--store <dir>`：自定义产物存储目录。
* `--locale <id>`：目标语言。

### `gc`

清理本地产物存储中孤立或未被引用的历史页面产物，释放磁盘空间：

```sh
sveltepress versions gc --dry-run
sveltepress versions gc
```

* `--dry-run`：只报告将会清理多少产物，不实际删除。
* `--locale <id>`：目标语言。
