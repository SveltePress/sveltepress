# Built-in Pagefind Local Search with Multi-Locale Support

**Status:** approved

## Requirement

> 弃用/补充 DocSearch，引入开箱即用的 Local Search（本地搜索），支持多语言与历史版本。

Replace or complement Algolia DocSearch with an out-of-the-box, zero-config Local Search powered by Pagefind, supporting multilingual sites and version management without external search crawlers.

## Problem Statement

Currently, documentation search in `@sveltepress/theme-default` relies on `@sveltepress/docsearch` (Algolia DocSearch). This has significant limitations:
1. **External dependency and onboarding friction**: Site authors must apply for Algolia DocSearch, configure API keys and indices, and wait for external web crawlers.
2. **Offline & Intranet unfriendliness**: Sites deployed on internal networks or read offline cannot use Algolia.
3. **Multi-locale and version management complexity**: Indexing multiple languages and historical versions requires maintaining separate indices or complex facet filters (`version` / `locale`), which Algolia crawlers often struggle to configure correctly across domains or subpaths.
4. **Hydration and bundle overhead**: Algolia CSS and JavaScript bundle sizes are non-trivial and mount external containers outside the standard Svelte 5 lifecycle.

## Solution

SveltePress introduces an integrated, zero-config **Local Search** powered by **Pagefind**:
1. **Automated Static Indexing**: During or immediately after the static production build (`dist/`), SveltePress runs Pagefind indexing over the generated HTML to emit `/pagefind/` static search assets into the build output.
2. **Native Svelte 5 Search Modal**: The Default Theme ships a native Svelte 5 search modal component designed with UnoCSS, dark/light mode synchronization, keyboard navigation (`Cmd+K` / `Ctrl+K`, arrows, Enter, Esc), and localized placeholder/result UI strings.
3. **Locale-Aware Search Filtering**: Search queries automatically scope results to the active locale via HTML `lang` attributes (injected by `createLocaleHandle`), preventing cross-language result pollution while offering an optional toggle to search all languages.
4. **Graceful Dev Experience**: In `dev` mode, the search modal remains reachable and displays helpful feedback that static full-text indexing is generated upon build (or loads pre-existing build indices if present).
5. **Backward Compatibility**: Existing sites with `themeOptions.docsearch` continue to load Algolia DocSearch. Local search is enabled by default when `docsearch` is omitted, or explicitly via `themeOptions.search = 'local'`.

## Grill Decisions

1. **Search Engine — Pagefind**. Pagefind runs in WebAssembly, has built-in CJK (Chinese) and multilingual segmentation, indexes static HTML directly, and requires zero client-side memory bloat or server runtimes.
2. **Build Integration — Automated Post-Build**. The framework orchestrates Pagefind indexing automatically upon completion of the static build (via SvelteKit static adapter hook / CLI `sveltepress versions build` completion), requiring no extra user build scripts.
3. **Frontend UI — Native Svelte 5 Modal**. Instead of Pagefind's default unstyled iframe/DOM UI, the theme implements a custom Svelte 5 modal component (`LocalSearch.svelte`) matching the SveltePress palette (`--svp-primary`), dark mode, and accessibility standards.
4. **Locale Isolation — Active Locale by Default**. Queries filter by the active page's `lang` attribute by default, ensuring Chinese documentation searches return Chinese results, with an option to expand to all locales.
5. **Version Handling — Historical Version Filter**. Current documentation searches the current version. When viewing historical version routes (`/v/<id>/...`), search can filter by that version or fall back cleanly.
6. **Coexistence with DocSearch — Opt-out / Graceful Precedence**. `themeOptions.docsearch` continues to work for legacy installations. When `docsearch` is absent, Local Search activates automatically.

## User Stories

1. As a documentation author, I want full-text search to work immediately upon building my site without signing up for Algolia or configuring API keys.
2. As a reader, I want to press `Cmd+K` (or `Ctrl+K`) on desktop or tap the search bar on mobile to instantly search across all documentation pages.
3. As a multilingual reader on `/zh/...`, I want search results to prioritize and display Chinese content instead of mixed English and Bengali snippets.
4. As a reader in dark mode, I want the search modal to match the theme's dark palette seamlessly without flashing light backgrounds.
5. As a developer running `pnpm dev`, I want the search modal to open gracefully and explain how search indexing works in development rather than crashing with an unhandled exception.
6. As an existing user with an established Algolia DocSearch account, I want my `themeOptions.docsearch` configuration to continue working without breaking changes.
7. As an intranet or offline documentation reader, I want search to function entirely within the browser without sending queries to third-party servers.

## Implementation Decisions

- **Package Dependencies**: Add `pagefind` as a dependency in `@sveltepress/vite` (or `@sveltepress/cli`).
- **Core Indexing Orchestration**:
  - In `@sveltepress/vite` (and CLI `versions build`), implement an indexer helper `indexSiteWithPagefind(outputDir: string, options?: PagefindOptions)`.
  - Trigger indexing when the static build finishes (e.g. at the end of `writeBundle` or when `svelte-kit build` exits with static adapter output).
  - Support exclusion of non-content elements via `data-pagefind-ignore` on navigation chrome (Navbar, Sidebar, Footer, VersionSelector) and `data-pagefind-body` on `<main>` content.
- **Theme-Default Search Component**:
  - Create `packages/theme-default/src/components/search/LocalSearch.svelte` using Svelte 5 runes (`$state`, `$derived`, `$effect`).
  - Dynamically load `/pagefind/pagefind.js` at runtime when the search modal is opened to keep initial bundle size lean.
  - Expose i18n dictionary entries for search in `DefaultThemeOptions.i18n`:
    - `searchPlaceholder`: e.g. "Search docs..." / "搜索文档..." / "ডকুমেন্ট অনুসন্ধান করুন..."
    - `searchNoResults`: e.g. "No results found" / "未找到相关结果"
    - `searchDevNotice`: e.g. "Search indexing is generated during production build." / "本地搜索索引在生产构建后生成，开发模式下不可用。"
    - `searchReset`: e.g. "Clear query"
- **Navbar Integration**:
  - Update `Navbar.svelte` and `NavbarMobile.svelte`:
    - If `localeOptions.docsearch`: load and render DocSearch.
    - If `localeOptions.search` is a custom component: render custom search.
    - Else (default): render `LocalSearch.svelte`.

## Testing Decisions

- **Core Indexer Tests (`packages/vite/__tests__/pagefind.test.ts`)**:
  - Verify Pagefind index creation on a mock static HTML directory.
  - Verify `data-pagefind-ignore` and multi-language attribute detection.
- **Theme Search Component Tests (`packages/theme-default/__tests__/local-search.test.ts`)**:
  - Verify search modal opens/closes on keyboard shortcuts (`Cmd+K`, `Escape`).
  - Verify i18n placeholder and strings render according to active locale.
  - Verify dev mode notice is displayed when `pagefind.js` is unavailable.
- **Production Build Integration Test (`scripts/check-version-management-build.mjs`)**:
  - Verify `dist/pagefind/pagefind.js` and index chunks are created during `pnpm check:versioning-build`.
  - Verify docs-site builds successfully and produces valid pagefind assets.

## Out of Scope

- Search in `@sveltepress/theme-blog` (blog theme continues using its existing search mechanism).
- Server-side dynamic database search (Elasticsearch / Meilisearch / Algolia Crawler management).
- Cloud search proxying or telemetry tracking.
