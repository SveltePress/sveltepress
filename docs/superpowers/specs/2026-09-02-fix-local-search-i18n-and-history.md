# Fix Local Search Multi-Locale Switching and Historical Version Indexing

**Status:** landing

## Requirement

> 修复 Local Search 跨语言 SPA 切换失效与历史版本页面污染两个核心缺陷，并更新 local-search 规范状态为 shipped。

Fix Pagefind local search multi-locale client-side switching and historical version snapshot pollution across the default theme and build pipeline.

## Problem Statement

When using SveltePress with both multi-locale documentation (`locales`) and version management (`versions`), built-in Local Search (Pagefind) exhibits two critical behavioral bugs:
1. **Client-side locale switching breaks search indexing:** When a reader performs a search on the default locale (English) and then switches to Chinese (`/zh/...`) using the language switcher, the search modal remains bound to the English Pagefind WebAssembly index. Searching for Chinese terms returns zero results because the search instance was initialized once as a singleton with English language metadata and was neither re-keyed by locale nor re-instantiated.
2. **Historical version pages pollute search results:** Pagefind indexes all HTML pages output to the build directory. Because the page layout unconditionally applies `data-pagefind-body` to all non-home pages, 165 historical version snapshot pages (e.g. `/v/2026-08-27/...`, `/zh/v/2026-08-28/...`) are indexed alongside the 84 current documentation pages. Readers on the current documentation receive outdated historical version results matching their queries. Clicking these links navigates them to historical documentation where the search bar displays "Search is not available for this documentation version."

## Solution

1. **Locale-Aware LocalSearch Lifecycle:**
   - In the Default Theme's navigation bar, key the `LocalSearch` component by both the current version identifier and active locale language tag (`${versionId}:${lang}`).
   - In `LocalSearch`, instantiate Pagefind using its isolated instance API (`createInstance({ basePath, language })`) or properly destroy the previous instance upon teardown, ensuring client-side navigation between locales cleanly loads the appropriate language index.
2. **Historical Version Index Exclusion:**
   - Restrict the `data-pagefind-body` attribute in the Default Theme layout to current, non-historical documentation pages (`!versionContext?.historical`).
   - Historical versions are excluded from the static search index by default, matching the design where historical versions fail closed and show search unavailable.
3. **Spec and Test Verification:**
   - Add unit and component test coverage asserting locale re-keying, instance teardown/creation, and historical body exclusion.
   - Mark the prior specification `docs/superpowers/specs/2026-09-02-local-search.md` as `shipped`.

## Grill Decisions

1. **Scope — Fix both locale switching and historical pollution:** Resolves both user-facing defects in built-in search alongside updating the local search spec status to shipped.
2. **Historical version handling — Exclude historical snapshots from indexing:** Only current documentation content carries `data-pagefind-body`. Historical versions without dedicated search configuration do not provide search and must not pollute current queries with duplicate or stale records.
3. **Locale re-keying and instance management — Navbar keying plus isolated instance lifecycle:** Navbar remounts `LocalSearch` on language change via its keyed block (`${versionId}:${lang}`), and `LocalSearch` properly isolates or cleans up its Pagefind instance to load the active language's WebAssembly and meta index.

## User Stories

1. As a reader switching from English documentation to Chinese documentation, I want Local Search to immediately query Chinese content, so that I find relevant translations without refreshing the browser.
2. As a reader searching current documentation, I want search results to show only current pages, so that I am never directed to outdated historical snapshots.
3. As a maintainer, I want documentation specs to accurately reflect shipped status, so that repository project tracking remains truthful.

## Implementation Decisions

- **Layout Tagging Contract:** The content wrapper in the default theme page layout adds `data-pagefind-body` only when the page is neither a home page nor a historical version page (`!isHome && !versionContext?.historical`). Historical version snapshots output standard content markup without `data-pagefind-body`, causing Pagefind to exclude them from indexing during production builds.
- **Navbar Search Mounting Contract:** The default theme `Navbar` keys the `LocalSearch` component on `${versionContext?.versionId || ''}:${localeOptions.lang || ''}`. When the active route transitions to a different locale prefix, the component remounts cleanly.
- **LocalSearch Instance Contract:** When loading search assets in `LocalSearch`, instantiate via `createInstance` with `basePath` and `language: currentLang` or destroy existing instances on teardown (`onDestroy` / cleanup effect). This ensures that any change in locale language loads the corresponding language dictionary and WebAssembly module.

## Testing Decisions

Tests must assert observable behavior at public seams without testing implementation internals:
- **Theme Search Component Seam (`packages/theme-default/__tests__/local-search.test.ts`):**
  - Verify that `Navbar` mounts `LocalSearch` with a key sensitive to locale language changes.
  - Verify that navigating across locales updates the search placeholder, language parameter, and loads the active locale's search index.
- **Page Layout Search Attribute Seam (`packages/theme-default/__tests__/seo-meta.test.ts` or `packages/theme-default/__tests__/version-components.test.ts`):**
  - Verify that current pages emit `data-pagefind-body` on `<div class="content">`.
  - Verify that historical version pages (`/v/<id>/...`) do not emit `data-pagefind-body`.
- **Static Indexing Seam (`packages/vite/__tests__/pagefind.test.ts`):**
  - Verify Pagefind indexes only documents carrying `data-pagefind-body` when present.

## Out of Scope

- Adding custom per-version Pagefind indices for historical versions that configure `search` metadata (historical versions continue to fail closed with the search unavailable notice).
- Changing Algolia DocSearch or Meilisearch external engine integrations.

## Acceptance Criteria

1. **Historical pages exclude data-pagefind-body:**
   - Command: `pnpm --dir packages/theme-default exec vitest run version-components.test.ts`
   - Passing: Vitest exits 0; assertions verify historical version page layout does not contain `data-pagefind-body`, while current page layout does.
2. **Local search remounts and re-indexes on locale change:**
   - Command: `pnpm --dir packages/theme-default exec vitest run local-search.test.ts`
   - Passing: Vitest exits 0; assertions verify `Navbar` keys `LocalSearch` across locales and language is properly initialized.
3. **Theme suite green:**
   - Command: `pnpm test:theme-default`
   - Passing: Vitest exits 0 with all 22+ test files passing.
4. **Vite core suite green:**
   - Command: `pnpm test:vite`
   - Passing: Vitest exits 0 with all 27 test files passing.
5. **Documentation parity green:**
   - Command: `pnpm check:docs:content`
   - Passing: Exits 0 with all locale pages passing.
6. **Prior local search spec marked as shipped:**
   - Command: `grep -E '^\\*\\*Status:\\*\\* shipped' docs/superpowers/specs/2026-09-02-local-search.md`
   - Passing: Exits 0 and outputs `**Status:** shipped`.
7. **Full suite green:**
   - Command: `pnpm test`
   - Passing: All repository test suites pass with exit code 0.

## Plan

- [x] **T1 — Historical Pagefind body exclusion.** Delivers: In `PageLayout.svelte` (and `strip-versioning.ts`), condition `data-pagefind-body` on `!versionContext?.historical`; add regression test in `version-components.test.ts`. Blocked by: nothing.
- [ ] **T2 — Locale-aware LocalSearch lifecycle and Navbar keying.** Delivers: In `Navbar.svelte` (and manifestless transform), key `LocalSearch` by `${versionContext?.versionId || ''}:${localeOptions.lang || ''}`; in `LocalSearch.svelte`, manage Pagefind instance via `createInstance({ basePath, language })` with teardown; add regression test in `local-search.test.ts`. Blocked by: T1.
- [ ] **T3 — Mark prior spec shipped & verify.** Delivers: Mark `docs/superpowers/specs/2026-09-02-local-search.md` status as `shipped`; run all acceptance criteria commands and ensure clean verification. Blocked by: T2.

## Baseline

1. `git status --short` -> Only the new spec file `docs/superpowers/specs/2026-09-02-fix-local-search-i18n-and-history.md`.
2. `pnpm --dir packages/theme-default exec vitest run version-components.test.ts` -> passes (23 tests passed).
3. `pnpm --dir packages/theme-default exec vitest run local-search.test.ts` -> passes (10 tests passed).
4. `pnpm test:theme-default` -> passes (22 files / 126 tests passed).
5. `pnpm test:vite` -> passes (27 files / 168 tests passed).
6. `pnpm check:docs:content` -> passes (30 pages across 3 locales).
7. `grep -E '^\*\*Status:\*\* shipped' docs/superpowers/specs/2026-09-02-local-search.md` -> FAILS (currently `**Status:** approved`).
8. `pnpm test` -> all suites pass (scripts, cli, vite, theme-default, theme-blog).

