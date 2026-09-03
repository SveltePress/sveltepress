# Frozen Historical Version Search with Persistent Pagefind Artifacts

**Status:** shipped

## Requirement

> 历史版本也要支持搜索，同时每个历史版本的搜索应当在历史版本确定的时候就固定了，不需要每次重新构建。

Support Pagefind local search on historical versions by persisting frozen search assets per version upon release and reusing them across subsequent builds without re-indexing.

## Problem Statement

Currently, historical version documentation snapshots (e.g. `/v/2026-08-27/...` or `/zh/v/2026-08-27/...`) fail closed and display "Search is not available for this documentation version." Readers navigating historical versions cannot search within that version's content. Rebuilding Pagefind indexes for all historical versions during every documentation site build would cause build times and asset churn to scale linearly with every past release, violating the immutable frozen snapshot architecture of SveltePress document versions.

## Solution

1. **Frozen Historical Search Persistence:**
   - When a historical documentation version is finalized or upon first build, SveltePress generates a dedicated Pagefind search index scoped exclusively to that version's content.
   - The generated search assets (`pagefind.js`, wasm, metadata, and fragments) are persisted into the version's immutable artifact/delta storage (e.g. `version-deltas/<id>/pagefind/` or `.sveltepress/version-artifacts/...`).
   - On subsequent production site builds, existing frozen search assets are copied directly to the distribution directory (e.g. `dist/v/<id>/pagefind/`, `dist/zh/v/<id>/pagefind/`), requiring zero re-indexing overhead.
2. **Dynamic Client-Side Version Scoping:**
   - In `LocalSearch`, the runtime derives the search asset location from the active version context and locale prefix.
   - On current documentation, it queries `/pagefind/pagefind.js` with base path `/pagefind/`.
   - On historical versions, it queries `${localePrefix}/v/${versionId}/pagefind/pagefind.js` with base path `${localePrefix}/v/${versionId}/pagefind/`.
   - The Navbar enables LocalSearch on historical versions rather than showing the "Search unavailable" message.

## Grill Decisions

1. **Asset storage — Persist in version source storage and copy on build:** Storing frozen Pagefind assets alongside the version deltas guarantees immutability, avoids re-indexing on every build, and allows committing or caching the assets with the release.
2. **Frontend loading — Path-based isolated Pagefind loading per version:** Instead of a single monolithic index with version filters, each historical version loads its own isolated, lightweight Pagefind bundle scoped to that version and locale.
3. **Automatic backfill on build:** Existing historical versions that lack frozen search assets have their assets built once and frozen into storage during the build pipeline, after which they are permanently reused.

## User Stories

1. As a reader browsing historical version `/v/2026-08-27/guide/`, I want to search documentation content from version `2026-08-27`, so that I can find documentation relevant to that specific historical release without navigating away.
2. As a site maintainer running production builds with multiple historical versions, I want historical search assets to be reused without re-indexing, so that build time remains fast and constant regardless of how many historical releases exist.
3. As a reader switching between different historical versions or between current and historical versions, I want the search results to strictly reflect the active version, so that I never see mixed or misleading documentation results.

## Implementation Decisions

- **Version Search Index Generation & Synchronization:** During post-build indexing or version composition, SveltePress inspects each historical version. If a frozen Pagefind index exists in the version delta store, it copies the assets to the output directory; if missing, it runs Pagefind targeting that historical version directory with `rootSelector: '.content'`, captures the resulting assets, and freezes them into the version delta store.
- **Navbar Search Availability Contract:** When LocalSearch is the active search engine (`localeOptions.search !== false && !localeOptions.docsearch`), the Navbar keeps search available on historical versions, mounting `LocalSearch` keyed by `${versionContext?.versionId || ''}:${activeLang}`.
- **LocalSearch Runtime Scoping:** `LocalSearch` derives its Pagefind asset URL and base path from the active `versionContext`. When viewing a historical version, it targets the version-prefixed pagefind path instead of the root `/pagefind/`.

## Testing Decisions

Tests must assert observable external behavior at public seams:
- **Theme Search Seam (`packages/theme-default/__tests__/local-search.test.ts`):**
  - Verify `Navbar` renders the `LocalSearch` button on historical version routes when using local search.
  - Verify `LocalSearch` loads the version-specific `pagefind.js` path when on a historical route.
- **Version Index Persistence Seam (`packages/vite/__tests__/pagefind.test.ts` or `scripts/__tests__/`):**
  - Verify Pagefind can index an isolated version directory and emit assets to a target path.
  - Verify frozen assets are preserved and copied without re-running indexer.
- **Build Output Seam (`scripts/check-version-management-build.mjs`):**
  - Verify `dist/v/<id>/pagefind/pagefind.js` and `dist/<locale>/v/<id>/pagefind/pagefind.js` exist in the production build output.
  - Verify historical home pages no longer display the search-unavailable status for local search.

## Out of Scope

- Merging historical version indices into a single unified search query (searching across all historical versions simultaneously).
- Re-indexing historical versions when non-content build tools or compiler versions change (historical versions are frozen).

## Acceptance Criteria

1. **LocalSearch mounts on historical version routes:**
   - Command: `pnpm --dir packages/theme-default exec vitest run local-search.test.ts`
   - Passing: Vitest exits 0; assertions verify `LocalSearch` button is rendered on historical routes and derives version-scoped asset paths.
2. **Version search index pipeline passes:**
   - Command: `pnpm --dir packages/vite exec vitest run pagefind.test.ts`
   - Passing: Vitest exits 0; assertions verify version directory indexing and asset emission.
3. **Production build contains frozen historical search assets:**
   - Command: `node scripts/check-version-management-build.mjs`
   - Passing: Exits 0 and verifies `dist/v/<id>/pagefind/pagefind.js` and `dist/<locale>/v/<id>/pagefind/pagefind.js` exist for historical versions.
4. **Theme suite green:**
   - Command: `pnpm test:theme-default`
   - Passing: Vitest exits 0 with all test files passing.
5. **Vite core suite green:**
   - Command: `pnpm test:vite`
   - Passing: Vitest exits 0 with all test files passing.
6. **Documentation parity green:**
   - Command: `pnpm check:docs:content`
   - Passing: Exits 0 with all locale documentation checks passing.
7. **Full repository test suite green:**
   - Command: `pnpm test`
   - Passing: All repository test suites exit 0.
8. **Changeset authored:**
   - Command: `test -f .changeset/frozen-historical-version-search.md && echo "changeset exists"`
   - Passing: Outputs `changeset exists` and file has semver patch/minor bump for affected packages.

## Plan

- [x] **T1 — Historical Version Pagefind Pipeline & Persistence.** Delivers: In `@sveltepress/vite`, extend Pagefind post-build indexing to handle historical version directories and persistence to version delta stores; add unit tests in `pagefind.test.ts`. Blocked by: nothing.
- [x] **T2 — Frontend Navbar & LocalSearch Version Scoping.** Delivers: In `Navbar.svelte`, keep LocalSearch enabled on historical versions; in `LocalSearch.svelte`, dynamically compute Pagefind asset path based on `versionContext`; add regression tests in `local-search.test.ts`. Blocked by: T1.
- [x] **T3 — Production Build Verification, Docs & Changeset.** Delivers: Update `check-version-management-build.mjs` to assert historical Pagefind assets; author `.changeset/frozen-historical-version-search.md`; run full test suites and mark spec as `shipped`. Blocked by: T2.

## Baseline

1. `git status --short` -> Only the new spec file `docs/superpowers/specs/2026-09-02-frozen-historical-version-search.md`.
2. `pnpm --dir packages/theme-default exec vitest run local-search.test.ts` -> passes (11 tests passed).
3. `pnpm --dir packages/vite exec vitest run pagefind.test.ts` -> passes (5 tests passed).
4. `pnpm test:theme-default` -> passes (22 files / 128 tests passed).
5. `pnpm test:vite` -> passes (27 files / 168 tests passed).
6. `pnpm check:docs:content` -> passes (30 pages across 3 locales).
7. `node scripts/check-version-management-build.mjs` -> passes (current verification without historical pagefind assertions).
8. `pnpm test` -> all suites pass.

