# Spec: Redesign Homepage with Elevated Aesthetic and Interactive Feature Showcases

Status: landing

## Requirement
首页重新设计下，要有设计感同时能体现功能特性

## Problem Statement
作为一个访问 SveltePress 官方网站的开发者或技术决策者，当前的首页虽然具备基础信息，但在视觉设计与核心功能特性的展示上存在明显痛点：
1. **视觉感染力与现代设计感不足**：Hero 区域视觉层级较为平淡，缺乏现代头部开发者工具（如 VitePress、Nextra、Tailwind）所具备的环境氛围光晕、动态公告标签以及高质感的排版层级，难以在一瞬间传递 SveltePress 现代、精致、高效的技术定位。
2. **核心杀手级功能特性缺乏层级区分**：当前所有 8 个特性（Markdown 居中、Svelte 5 Runes、多语言支持、版本管理、本地搜索、类型友好等）以均等的简单卡片平铺，重点不突出。用户无法一目了然地识别出 SveltePress 相比其他 SSG/文档工具独具优势的三大杀手特性（Svelte 5 组件与 Runes 在 Markdown 中的深度融合、企业级不可变文档版本管理、毫秒级本地全文搜索）。
3. **功能特性缺乏直观的“所见即所得”交互演示**：当前的 HeroCode 仅为静态的 CSS 简易视窗，缺少多场景切换与交互性，不能让开发者直接在首页直观体验和操作 Svelte 5 响应式组件或 Twoslash 类型提示。
4. **快速上手链路过长**：缺少一键复制安装脚手架命令（如 `pnpm create sveltepress`）的终端组件，用户需要点击进入文档内部才能找到初始命令。

## Solution
全面升级 SveltePress 首页，在 `@sveltepress/theme-default` 主题引擎层与 `packages/docs-site` 官方文档站两层进行端到端重构：
1. **现代精致开发者工具设计基调**：
   - 引入暗色自适应的高级柔和网格氛围光影（Ambient Glow）与高对比度字体排版层级。
   - 增加顶部动态公告胶囊 Badge（如提示 Svelte 5 & Runes 支持），引导用户探索最新特性。
   - 增加支持一键复制的终端脚手架命令栏（Install Command Bar），缩短开发者尝试的转化路径。
2. **多场景交互式 Hero 代码/渲染演示视窗**：
   - 重构 HeroCode 为多 Tab 交互式视窗，预设 3 大高频场景（Svelte 5 Runes 响应式组件、Callout 提示块渲染、TypeScript Twoslash 悬浮提示）。
   - 右侧实时视窗支持真实交互（如可点击累加的计数器按钮），用实际动效与微交互呈现“Markdown + Svelte 5”的极致体验。
3. **Bento Spotlight 阶梯式特性矩阵**：
   - 扩展特性数据契约，支持 `spotlight: true` 与分类 `tag`，向后兼容现有主题站点。
   - 突出展示三大杀手特性宽幅焦点卡片，下接次级核心能力矩阵，层级鲜明。
4. **全语言版本同步升级**：
   - 针对英文（`/`）、中文（`/zh/`）、孟加拉文（`/bn/`）同步重构对应首页 frontmatter、文案与特性阐释，全平台移动端与桌面端零横向溢出且完美自适应。

## Grill Decisions
1. **改造范围与架构定界**：采用“主题引擎通用增强 + 官方文档站首发落地”的双层架构。既提升 `@sveltepress/theme-default` 的通用组件能力，让所有使用该主题的下游站点都能受益；又在 `packages/docs-site`（中、英、孟）中注入高水准内容。
2. **视觉基调**：采用现代精致开发者工具风格。使用柔和径向弥散光晕、玻璃拟态微模糊、精致边框与平滑悬浮过渡，保持浅色与深色模式的高可读性与无缝切换。
3. **特性卡片结构**：采用 Bento Spotlight 阶梯式布局替代均等平铺。优先聚焦三大杀手特性（Svelte 5 in Markdown、文档版本管理、毫秒级本地搜索），其余特性以紧凑网格承接。
4. **Hero 视觉机制**：升级为交互式多 Tab 演示视窗。展示真实的 Svelte 5 Runes `$state`、原生 Markdown 拓展以及 Twoslash 类型悬浮，突出产品的核心技术差异。
5. **快速安装与公告**：在 Hero 区域集成公告 Badge 与可一键复制命令栏，提升开发者体验。
6. **多语言覆盖**：全量覆盖中、英、孟三种语言的首页，保证全球化体验一致。

## User Stories
1. **US1 (Modern Visual First Impression)**: As a visiting developer, I want to see a visually polished homepage with ambient glow, modern typography, and an announcement badge, so that I immediately perceive SveltePress as a modern, high-quality documentation framework.
2. **US2 (Instant Interactive Code Showcase)**: As a frontend engineer, I want to switch between code tabs (Runes, Callouts, Twoslash) and interact with rendered UI in the Hero section, so that I can immediately experience how Svelte 5 and Markdown blend seamlessly.
3. **US3 (One-Click Installation)**: As a developer ready to start a project, I want to copy the quick-start scaffolding command with a single click, so that I can set up a SveltePress project immediately in my terminal.
4. **US4 (Spotlight Killer Features)**: As an architectural decision maker, I want the core features to highlight Svelte 5 Runes, Version Management, and Local Search as prominent spotlight cards, so that I quickly understand the platform's key technical differentiators.
5. **US5 (Comprehensive Secondary Capabilities)**: As a content author, I want to view clear cards for markdown features, full SvelteKit capabilities, theme customizability, and typing, so that I understand the complete feature set.
6. **US6 (Seamless Responsive & Theme Switching)**: As a user on mobile devices or in light/dark mode, I want the homepage layout, ambient effects, code preview, and copy interaction to render flawlessly with zero overflow, so that I have a consistent reading experience across all devices.
7. **US7 (Localized Experience)**: As a non-English speaker browsing in Chinese or Bengali, I want the new homepage layout, hero messaging, install widget, and spotlight cards to be accurately translated into my language, so that I can explore SveltePress comfortably.

## Implementation Decisions
- **组件分层与契约扩展**：
  - 在主题层 `packages/theme-default` 的 `Home.svelte` 扩展支持 `badge`（格式 `{ text: string, link?: string }`）与 `installCommand`（格式 `{ command: string, packageManager?: string }` 或 string）。
  - 在 `Feature.svelte` 中支持 `spotlight?: boolean` 与 `tag?: string` 属性，渲染为 Bento 风格的焦点宽幅卡片与普通卡片的不同栅格样式，保持对未配置该属性的旧站点的 100% 向上兼容。
  - 重构 `HeroCode.svelte`，引入可切换的 Tab 选项卡状态与交互式运行视窗，包含真实 Svelte 响应式事件（Runes 计数器交互）与 Twoslash 悬浮说明。
  - 新增 `InstallCommand.svelte`（或内置于 Home 动作栏），实现带有复制代码状态（点击后图标变为 Checkmark，短暂提示 Copied）的终端风格交互条。
- **文档站落地与内容构建**：
  - 在 `packages/docs-site/src/routes/+page.md`、`zh/+page.md`、`bn/+page.md` 中升级 frontmatter：
    - 配置 `badge` 指向新特性说明。
    - 配置 `installCommand: "pnpm create sveltepress"`。
    - 升级 `features` 列表，将 Svelte 5 in Markdown、Document Version Management、Instant Local Search 标记为 `spotlight: true` 并配上醒目的描述与图标。
    - 保留并润色其余特性卡片。
- **样式与深浅色模式规范**：
  - 纯 UnoCSS + 原生 CSS 变量驱动，不引入任何多余庞大的第三方 UI 库，保持 SveltePress 极致轻量的体积标准。
  - 遵循现有的 UnoCSS 断点规则（`sm: 950px`、`md: 1240px`）和 `--svp-primary` 色彩体系，确保在暗色和浅色模式下对比度达标。

## Testing Decisions
- **Seams**:
  - **Theme Default Unit/Contract Seam**: 在 `packages/theme-default/__tests__/home-redesign.test.ts` 中针对 `Home.svelte`、`HeroCode.svelte`、`Feature.svelte` 进行行为契约验证（验证 spotlight 卡片分类渲染、badge 渲染、installCommand 交互逻辑、HeroCode 多 Tab 数据与交互渲染）。
  - **Docs Site Typecheck Seam**: 在 `packages/docs-site` 运行 `pnpm check`（svelte-check），验证所有多语言首页 frontmatter 及 Svelte 模板的类型与运行时安全。
  - **Full Monorepo Verification Seam**: 运行全量单元测试与构建流水线。
- **Prior Art**: 借鉴 `packages/theme-default/__tests__/typography-styles.test.ts`、`local-search.test.ts`、`pwa-options.test.ts` 的行为驱动测试范式。

## Out of Scope
- 修改文档站内部的正文文档页面（`/guide/*`）排版与样式（本规范严格聚焦于首页 `/`、`/zh/`、`/bn/`）。
- 更改底层 markdown 编译器或 vite 插件核心逻辑（非编译层改动）。
- 替换现有的 UnoCSS 或 SvelteKit 底层架构。

## Acceptance Criteria
1. **Theme Default Home Redesign Unit Tests Pass**:
   - Command: `cd packages/theme-default && npx vitest run __tests__/home-redesign.test.ts`
   - Output: `✓ __tests__/home-redesign.test.ts` and `Test Files  1 passed`
2. **Docs-site Svelte Check Passes Cleanly**:
   - Command: `cd packages/docs-site && pnpm check`
   - Output: `svelte-check found 0 errors and 0 warnings`
3. **All Theme Default Tests Pass**:
   - Command: `pnpm test:theme-default`
   - Output: `Test Files  25 passed` (all pass)
4. **All Monorepo Core Tests Pass**:
   - Command: `pnpm test`
   - Output: All test suites pass with 0 failures
5. **Docs Site Production Build Succeeds**:
   - Command: `cd packages/docs-site && pnpm build`
   - Output: SveltePress / SvelteKit build completes with 0 errors

## Baseline Verification
- Working tree: clean before implementation.
- Proof Command 1 (`cd packages/theme-default && npx vitest run __tests__/home-redesign.test.ts`): Fails with `No test files found, exiting with code 1` (expected red baseline before test creation).
- Proof Command 2 (`cd packages/docs-site && pnpm check`): Passes with `svelte-check found 0 errors and 0 warnings`.
- Proof Command 3 (`pnpm test:theme-default`): Passes with 24 test files passed (158 tests passed).
- Proof Command 4 (`pnpm test`): Passes with 494 tests passed across all suites.
- Proof Command 5 (`cd packages/docs-site && pnpm build`): Passes with static site written to dist.

## Plan
- [x] Ticket 1: Core Theme Home Enhancements (Ambient Glow, Badge, InstallCommand, Bento Spotlight Features) — Delivers badge, copy command, and Bento spotlight layout in theme-default with passing test suite (Blocked by: none)
- [x] Ticket 2: Interactive Multi-Tab Hero Visual (`HeroCode.svelte`) — Delivers interactive tabbed HeroCode supporting Runes counter, Callouts, and Twoslash with micro-interactions (Blocked by: Ticket 1)
- [ ] Ticket 3: Official Documentation Site Homepage Redesign (En, Zh, Bn) & Verification — Delivers updated multilingual homepages, changeset, and end-to-end build verification (Blocked by: Ticket 2)

