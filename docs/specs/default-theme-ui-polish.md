# Spec: Default Theme Content Typography and Micro-Component UI Polish

Status: shipped

## Requirement
针对当前的默认主题，从 UI角度有没有什么可以优化的地方

## Problem Statement
当前 `@sveltepress/theme-default` 在主体内容区域的排版缺少基础且关键的样式规则：
1. **Markdown 表格 (Table)**：没有内置样式定义，表格直接渲染为浏览器默认的无边框/原生布局，在小屏幕（如移动端）下无法自适应横向滚动，导致表格内容撑破容器或阅读极度拥挤。
2. **行内代码 (`code`)**：缺少非 `pre` 容器内的行内高亮背景和内边距支持（除 `admonition code` 外），导致正文中反引号包裹的代码、变量名与普通纯文本对比度弱，视觉区分不明显。
3. **引用块 (`blockquote`)**：缺乏专属的左侧引导色条、内边距和背景微调，使得引用段落无法与主体正文形成视觉落差。
4. **按键标签 (`<kbd>`)**：缺乏键盘键帽拟物微阴影与按键外框，快捷键说明缺乏现代交互质感。

## Solution
在 `@sveltepress/theme-default` 的通用全局样式与页面布局中补充高质量的排版细节规范：
1. **表格现代排版与自适应横向滚动**：
   - 使用整洁的微边框、浅色表头底色、单元格舒适内边距与微妙隔行斑马纹。
   - 提供表格横向滚动容器机制或自适应 `overflow-x: auto` 规则，并适配暗色模式。
2. **行内代码微质感**：
   - 针对正文段落及列表中的 `:not(pre) > code` 赋予微圆角、独立字阶、适度 padding 以及随深浅模式自适应的柔和底色与微边框。
3. **引用块排版**：
   - 提供左侧 4px 品牌/中性色竖条、字体微倾斜、左内边距与轻微背景微色差。
4. **键盘键帽样式**：
   - 针对 `<kbd>` 提供立体的微阴影、中性边框和字距微调。

## Grill Decisions
1. **优化方向聚焦**：聚焦于「内容排版与组件细节打磨」，确保基础文档排版在各种设备上阅读体验提升。
2. **设计调性**：精致现代与轻量原生感，不破坏现有极简基调，色彩与现有 rose/amber/zinc 调色板一致。
3. **具体涉及模块**：
   - 表格（Table）：边框、斑马纹、表头底色、自适应滚动。
   - 行内代码（Inline Code）：非 `pre` 的 `code` 样式强化。
   - 引用块（Blockquote）：左侧色条与轻微背景。
   - 键盘（Kbd）：拟物键帽质感。

## User Stories
1. **US1 (Table Readability)**: As a document reader, I want markdown tables to have clear borders, distinct header backgrounds, and zebra striping, so that dense tabular data is easy to scan.
2. **US2 (Table Mobile Scrolling)**: As a mobile reader, I want wide tables to scroll horizontally within their container, so that they do not break page layout.
3. **US3 (Inline Code Distinction)**: As a developer reading docs, I want inline code snippets to have comfortable padding and subtle background color, so that I can easily spot identifiers and code terms.
4. **US4 (Blockquote & Kbd Aesthetics)**: As a reader, I want quotes and keyboard shortcuts to have distinct editorial styling, so that callouts and shortcut combinations are visually recognizable.

## Implementation Decisions
- 样式承载点集中在 `packages/theme-default/src/style.css` 及 `packages/theme-default/src/components/PageLayout.svelte` 的内容容器作用域 `:global(.theme-default--page-layout .content)` 下，避免污染与冲突。
- 保持浅色模式与暗色模式的严谨适配（使用现有 CSS 变量体系与 zinc 中性色阶）。
- 保持无多余运行时依赖，纯 CSS 声明，零 JS 额外体积损耗。

## Testing Decisions
- **Seam**: 在 `packages/theme-default` 的测试层，针对编译后的布局与样式契约添加单元测试，并在 docs-site 中进行实际渲染验证。
- **Prior Art**: 参照现有的 `packages/theme-default/__tests__/manifestless-bundle.test.ts` 及 `packages/theme-default/__tests__/pwa-options.test.ts` 等样式与渲染测试模式。

## Out of Scope
- 重构侧边栏（Sidebar）折叠机制或 TOC 平滑跟踪算法。
- 修改 Markdown 解析管线与 rehype/remark 语法插件。

## Acceptance Criteria
1. `pnpm --filter @sveltepress/theme-default exec vitest run __tests__/typography-styles.test.ts` 运行通过，验证 `:not(pre) > code`、`table`、`blockquote`、`kbd` 的样式存在。
2. `pnpm --filter @sveltepress/theme-default exec vitest run __tests__/manifestless-bundle.test.ts` 保持通过，验证无版本打包哈希契约。
3. `pnpm lint` 格式检查通过无报错。
4. `pnpm test` 全库测试套件全部通过。

## Baseline Proof Runs
- Criterion 1: `pnpm --filter @sveltepress/theme-default exec vitest run __tests__/typography-styles.test.ts` -> RED (file does not exist yet: `No test files found, exiting with code 1`).
- Criterion 2: `pnpm --filter @sveltepress/theme-default exec vitest run __tests__/manifestless-bundle.test.ts` -> GREEN (`1 passed (1)` in 114ms).
- Criterion 3: `pnpm lint` -> GREEN (all files pass ESLint cleanly).
- Criterion 4: `pnpm test` -> GREEN (all 458 tests pass across scripts, cli, vite, theme-default, theme-blog).

## Plan
- [x] Ticket 1: 排版样式增强（Table, Code, Blockquote, Kbd） — Delivers complete light/dark responsive typography styling for table, inline code, blockquote, and kbd in style.css and PageLayout.svelte. (Blocked by: none)
- [x] Ticket 2: 样式契约与行为测试 — Delivers typography-styles.test.ts and updates manifestless hashes if needed. (Blocked by: Ticket 1)
- [x] Ticket 3: 变更集作者化与全库构建验证 — Delivers changeset file, passes pnpm lint and pnpm test end-to-end. (Blocked by: Ticket 2)
