---
title: 文档版本管理
---

SveltePress 可以让最新版文档继续使用普通 URL，同时把不可变的历史快照发布到 `/v/8.1/` 之类的路径。该能力默认关闭；没有 `sveltepress.versions.json` 的站点行为不变。

## 安装与初始化

```sh
pnpm add -D @sveltepress/cli
pnpm exec sveltepress versions init --current 8.1 --label "8.1"
```

命令会创建 `sveltepress.versions.json`。Vite 插件会自动发现它；可以用 `sveltepress({ versions: false })` 关闭，或用 `sveltepress({ versions: { manifest: 'path/to/versions.json' } })` 指定其他清单。

## 创建发版快照

直接创建下一个当前版本。CLI 会自行解析站点的 Vite 与默认主题配置，因此无需预先构建也能冻结当前侧栏：

```sh
pnpm exec sveltepress versions create 8.2 --label "8.2"
pnpm exec sveltepress versions validate
```

`create` 会把选中的路由源码复制到 `src/routes/v/8.1/`，冻结路由和侧栏元数据，把 `8.1` 移入历史版本，并将 `8.2` 设为当前版本。重复 ID、符号链接、脏 Git 工作区和冻结边界外的依赖都会被拒绝。只有当未提交内容就是本次发版来源时才使用 `--allow-dirty`。

操作是原子的：预检失败不会留下半成品快照，也不会修改清单。`versions list` 列出版本，`versions validate` 检查缺失或孤立的快照目录。

## 清单配置

```json
{
  "$schema": "./node_modules/@sveltepress/cli/schema/versions.schema.json",
  "basePath": "/v",
  "current": { "id": "8.2", "label": "8.2" },
  "versions": [
    {
      "id": "8.1",
      "label": "8.1",
      "status": "deprecated",
      "message": "请升级到 8.2。",
      "sourceRef": "v8.1.0",
      "search": { "facetFilters": ["version:8.1"] }
    }
  ],
  "content": {
    "include": ["**"],
    "exclude": ["internal/**"],
    "shared": ["$lib/**", "static/**"]
  }
}
```

版本 ID 必须是适合 URL 的小写标识，可包含点和连字符。`include`、`exclude` 决定冻结哪些路由文件；`shared` 明确声明不复制、继续引用当前文件的依赖。共享清单应尽量小，因为未来修改会影响所有历史版本。

把 `status` 设为 `deprecated` 或 `eol` 会显示生命周期提示。`sourceRef` 让历史页面的编辑链接指向对应 Git ref，也可用 `editLink: false` 隐藏。EOL 版本默认输出 `noindex`，其他版本可用 `noIndex: true` 主动关闭索引。

## 导航、搜索与构建输出

默认主题会自动加入可键盘操作的版本选择器。历史版本中的内部链接和冻结侧栏会留在同一版本；切换时优先保留当前逻辑页面，目标版本不存在该页面时则进入其首页并显示说明。

历史搜索默认不可用，只有为该版本明确配置 `search` 后才启用。自定义搜索组件会收到当前版本及搜索元数据，DocSearch 会使用配置的 facet 过滤，避免把最新版结果误认为历史文档。

版本构建还会输出页面 canonical、版本化 `sitemap.xml` 和 `/v/{id}/llms.txt`，根目录 LLM 文件只包含当前文档。PWA 不预缓存历史 HTML，并对历史页面使用 network-first 策略。

自定义主题可导入 `virtual:sveltepress/versions`，使用其中的清单与路径解析函数。快照目录应作为发版生成物审查并提交，不要手工修改；修订当前路由后再创建下一版快照。

## 说明当前版本新增了什么

SveltePress 会按清单顺序比较当前路由与最近的历史版本。只存在于当前版本的路由会被列为新增页面。可通过 frontmatter 补充摘要或排除不应进入变化总览的页面：

```yaml
---
title: 新增内容
versionChanges:
  exclude: true
  summary: 可选的页面摘要
---
```

已有 Markdown 页面中的重点新增段落使用显式标记；版本、标题和页面内唯一的稳定 ID 都是必填项：

```md
:::since[热更新配置]{version="8.2" id="hot-reload" summary="无需重启"}
这里是新增的文档内容。
:::
```

未知版本、重复 ID、未知字段或错误类型会直接终止开发服务器和生产构建。新增页面只进入“新增页面”，不会因为内部存在 `since` 标记而再次进入“更新页面”；第一个受管理版本没有比较基准，也不会把整站视为新增。

默认主题只在浏览内容首次引入的版本时显示页面和段落标签。站点可以自行决定变化总览 URL：

```svelte title="src/routes/whats-new/+page.svelte"
<script>
  import VersionChanges from '@sveltepress/theme-default/VersionChanges.svelte'
</script>

<VersionChanges />
```

可在本站的[新增内容页面](/whats-new/)查看对应路由示例。

组件默认展示当前版本，通过 `?version={id}` 切换历史记录。当前链接不加前缀，历史链接精确指向 `/v/{id}/...` 及段落锚点。

自定义主题可以读取相同的冻结数据：

```ts
import { changeSets, resolveVersionChanges } from 'virtual:sveltepress/versions'

const currentChanges = resolveVersionChanges()
const historicalChanges = resolveVersionChanges('8.1')
```

`versions create` 会把即将冻结的当前变化集写入 `.sveltepress-version.json`。历史变化只从该元数据读取；`versions validate` 还会检查标记、版本引用、锚点唯一性和快照漂移。
