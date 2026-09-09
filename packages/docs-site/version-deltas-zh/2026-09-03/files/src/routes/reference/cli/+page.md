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

* `--current <id>`：初始版本标识符（默认为 `'current'`）。
* `--label <label>`：当前版本的显示名称。
* `--base-path <path>`：历史路由的基础前缀（默认为 `'/v'`）。
* `--locale <id>`：目标语言（如 `zh`、`bn`）。会生成 `sveltepress.versions.<locale>.json`。

### `create`

将当前文档快照冻结为不可变的历史版本：

```sh
sveltepress versions create 1.0 --label "v1.0"
```

* `<version-id>`：冻结版本的唯一标识符。
* `--label <label>`：在版本切换器中展示的文本（默认为 `<version-id>`）。
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

### `plan`

预览增量构建计划，查看页面复用情况、变更路由以及失效原因：

```sh
sveltepress versions plan
```

* `--locale <id>`：目标语言。

### `build`

执行支持版本管理的生产编译。未指定 `--locale` 时，会自动编译并整合所有语言：

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

在版本清单中更新生命周期状态（`stable`、`deprecated`、`eol`）以及提示信息：

```sh
sveltepress versions publish --status deprecated --message "请升级到最新版"
```

* `--status <stable|deprecated|eol>`：新的生命周期状态。
* `--message <text>`：横幅警告提示文案。
* `--locale <id>`：目标语言。

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
sveltepress versions gc
```

* `--locale <id>`：目标语言。
