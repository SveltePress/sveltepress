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

## 启用增量产物

已有站点只需迁移一次已提交的完整快照；新站点可在 `versions init` 后直接执行同一命令：

```sh
pnpm exec sveltepress versions migrate --site-id docs-example
```

迁移会用已提交的 `version-deltas/{id}` 源码增量替代完整的 `src/routes/v/{id}` 副本，并在 `.sveltepress/version-artifacts` 初始化内容寻址页面存储。该存储属于构建缓存；应提交源码增量，并在 CI 中恢复或缓存产物存储。

生产构建脚本应改为：

```json
{
  "scripts": {
    "build": "sveltepress versions build"
  }
}
```

`versions plan` 会在不构建的情况下报告需要编译、复用、删除和重新组合的路由。`versions build` 会从已提交增量恢复缺失的历史产物，只编译当前版本中真正变化的页面，以稳定 SveltePress 壳层组合全部路由，然后执行正常的 Vite 生产构建。壳层或索引变化可以重新组合路由而不重编译页面内容；页面编译器或产物 schema 变化则会有意使所有页面产物失效。

在 GitHub Actions 中，可在构建前恢复最近的兼容存储，并按当前提交保存更新后的存储：

```yaml
- uses: actions/cache@v4
  with:
    path: .sveltepress/version-artifacts
    key: sveltepress-pages-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      sveltepress-pages-${{ runner.os }}-
- run: pnpm build
```

其他 CI 平台应使用对应的持久化缓存能力。不同 `siteId` 不要共用同一个存储。

页面生成模块（包括 Default Theme 的 LiveCode 组件）会写入所属页面产物。CI 只需缓存 `.sveltepress/version-artifacts`；`.sveltepress/live-code` 是本地开发临时目录，恢复复用页面时不需要它。

## LiveCode 产物自检

本页会实际使用上述能力。下面的交互组件由当前 Markdown 文件生成并写入页面产物；删除本地 `.sveltepress/live-code` 目录后，它仍会在复用产物的构建中完成服务端渲染。卡片能正常显示且按钮可以交互，就说明可复用产物和客户端水合链路都正常工作。

```svelte live
<script>
  let interactions = $state(0)
  const checks = [
    '生成模块已嵌入',
    '服务端渲染完成',
    '客户端水合就绪',
  ]
</script>

<section class="artifact-check" data-version-artifact-live-code>
  <div class="artifact-check__status" aria-hidden="true">✓</div>
  <div class="artifact-check__content">
    <p class="artifact-check__eyebrow">实时文档检查</p>
    <h3>产物自检通过</h3>
    <ul>
      {#each checks as check}
        <li><span aria-hidden="true">✓</span>{check}</li>
      {/each}
    </ul>
    <button type="button" onclick={() => interactions++}>
      测试交互{interactions ? ` · ${interactions}` : ''}
    </button>
  </div>
</section>

<style>
  .artifact-check {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    overflow: hidden;
    padding: 1.25rem;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: 1rem;
    background:
      radial-gradient(circle at 100% 0%, rgb(255 94 122 / 18%), transparent 45%),
      color-mix(in srgb, currentColor 4%, transparent);
  }

  .artifact-check__status {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    border-radius: 0.85rem;
    color: #14231a;
    font-size: 1.4rem;
    font-weight: 800;
    background: #70e19b;
    box-shadow: 0 0 0 0.35rem rgb(112 225 155 / 12%);
  }

  .artifact-check__content h3,
  .artifact-check__content p {
    margin: 0;
  }

  .artifact-check__eyebrow {
    color: #ff5e7a;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  .artifact-check__content h3 {
    margin-top: 0.15rem;
    font-size: 1.2rem;
  }

  .artifact-check__content ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.85rem 0;
    padding: 0;
    list-style: none;
  }

  .artifact-check__content li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.55rem;
    border-radius: 999px;
    font-size: 0.78rem;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .artifact-check__content li span {
    color: #45c97c;
    font-weight: 800;
  }

  .artifact-check__content button {
    padding: 0.55rem 0.8rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 0.65rem;
    color: inherit;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    background: transparent;
    cursor: pointer;
  }

  .artifact-check__content button:hover {
    border-color: #ff5e7a;
  }
</style>
```

## 创建发版快照

:::since[先推进版本，再编辑下一版文档]{version="2026-08-31" id="next-version-doc-workflow" summary="先冻结 outgoing 文档，再编辑新 current 并添加版本标记。"}
从干净、完整的 outgoing 文档开始。在编辑下一版页面或添加对应的 `:::since` 标记之前，先构建并创建下一版本。`create` 会冻结 outgoing current，并把传入的 ID 设为新的 current；只有此后，新文档才应使用这个 ID。

```sh
pnpm exec sveltepress versions build
pnpm exec sveltepress versions create 8.2 --label "8.2"

# 8.2 现在是 current：编辑文档并添加 version="8.2" 标记

pnpm exec sveltepress versions build
pnpm exec sveltepress versions validate
```

不要在已经写入下一版内容的文档上直接运行 `versions create`，否则这些改动会被错误地冻结到 outgoing 版本中。如果已经提前开始编辑，应先恢复已知的干净 outgoing 状态，完成构建和版本推进，再把改动重新应用到新的 current。
:::

`create` 会发布当前草稿清单，只把变化页面和 tombstone 写入 `version-deltas/8.1/`，冻结路由、侧栏和变化元数据，把 `8.1` 移入历史版本，并将 `8.2` 设为当前版本。过期草稿、重复 ID、符号链接、脏 Git 工作区和冻结边界外的依赖都会被拒绝。只有当未提交内容就是本次发版来源时才使用 `--allow-dirty`。

已发布版本还会获得自动生成的 `sourceHash`，每个 delta 还会用元数据哈希绑定冻结的路由、侧栏和变化目录。`versions validate` 会重建每个已提交 delta 并检查这两个哈希，因此即使产物缓存为空也能发现源码或元数据漂移。不要手工修改哈希或 delta 文件。

操作是原子的：预检失败不会留下半成品增量，也不会修改清单。`versions list` 列出版本顺序，`versions publish 8.1` 输出供 CI 发布使用的不可变清单哈希，`versions gc --dry-run` 可在清理前报告未引用的本地产物。

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
  },
  "artifacts": {
    "mode": "incremental",
    "siteId": "docs-example",
    "store": ".sveltepress/version-artifacts",
    "sources": "version-deltas"
  }
}
```

版本 ID 必须是适合 URL 的小写标识，可包含点和连字符。`include`、`exclude` 决定冻结哪些路由文件；`shared` 明确声明不复制、继续引用当前文件的依赖。共享清单应尽量小，因为未来修改会影响所有历史版本。

把 `status` 设为 `deprecated` 或 `eol` 会在全站导航上方显示醒目的旧版横条，提示旧版站点的功能可能不可用，并链接到最新版的同一逻辑页面。`sourceRef` 让历史页面的编辑链接指向对应 Git ref，也可用 `editLink: false` 隐藏。EOL 版本默认输出 `noindex`，其他版本可用 `noIndex: true` 主动关闭索引。

## 导航、搜索与构建输出

默认主题会自动加入可键盘操作的版本选择器。历史版本中的内部链接和冻结侧栏会留在同一版本；切换时优先保留当前逻辑页面，目标版本不存在该页面时则进入其首页并显示说明。

历史搜索默认不可用，只有为该版本明确配置 `search` 后才启用。自定义搜索组件会收到当前版本及搜索元数据，DocSearch 会使用配置的 facet 过滤，避免把最新版结果误认为历史文档。

版本构建还会输出页面 canonical、版本化 `sitemap.xml` 和 `/v/{id}/llms.txt`，根目录 LLM 文件只包含当前文档。PWA 不预缓存历史 HTML，并对历史页面使用 network-first 策略。

自定义主题可导入 `virtual:sveltepress/versions`，使用其中的清单与路径解析函数。`version-deltas` 是不可变的发版源码，应审查并提交但不要手工修改。冷 CI 可以用它恢复产物，而持久化 CI 缓存可避免重新编译历史页面；修订当前路由后再创建下一版增量。

在浏览器代码中直接从包导入这些解析函数时，请使用 `@sveltepress/vite/versioning/runtime`；该入口不包含 Node 文件系统代码。构建和配置代码仍可使用 `@sveltepress/vite/versioning`。

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
### 热更新

已有的文档内容。

:::since[热更新配置]{version="8.2" id="hot-reload" summary="无需重启"}
这里是新增的文档内容。
:::
```

未知版本、重复 ID、未知字段或错误类型会直接终止开发服务器和生产构建。新增页面只进入“新增页面”，不会因为内部存在 `since` 标记而再次进入“更新页面”；第一个受管理版本没有比较基准，也不会把整站视为新增。

默认主题只在浏览内容首次引入的版本时显示页面和段落标签。站点可以自行决定变化总览 URL：

侧边栏会为新增页面和更新页面显示紧凑的“新”徽章。如果 `:::since` 标记自身不含标题，默认主题会自动把它关联到同一 Markdown 容器中最近的前置标题，并在“当前页面”目录中为该标题显示同一徽章；标记内部的标题则直接与该标记关联。同一个标题可以关联多个标记，只要当前版本匹配其中任意一个，目录中就只显示一个徽章。可通过 `i18n.versionNavigationNewLabel` 覆盖紧凑文案。

```svelte title="src/routes/whats-new/+page.svelte"
<script>
  import VersionChanges from '@sveltepress/theme-default/VersionChanges.svelte'
</script>

<VersionChanges />
```

可在本站的[新增内容页面](/whats-new/)查看对应路由示例。

:::since[按路由隔离的新增内容]{version="2026-08-31" id="version-scoped-whats-new" summary="让每个“新增内容”路由使用自身相对上一版本冻结的变化集。"}
`VersionChanges` 默认采用当前页面 URL 解析出的文档版本；有效的 `?version={id}` 可显式覆盖该上下文。每个版本的变化总览都以清单中紧邻的上一版本为比较基准，历史变化集冻结后不受后续当前文档影响。当前链接不加前缀，历史链接精确指向 `/v/{id}/...` 及段落锚点。
:::

自定义主题可以读取相同的冻结数据：

```ts
import { changeSets, resolveVersionChanges } from 'virtual:sveltepress/versions'

const currentChanges = resolveVersionChanges()
const historicalChanges = resolveVersionChanges('8.1')
```

`versions create` 会把即将冻结的当前变化集写入不可变产物清单和源码增量。历史变化只从冻结元数据读取；`versions validate` 还会检查标记、版本引用、锚点唯一性、损坏产物和增量漂移。
