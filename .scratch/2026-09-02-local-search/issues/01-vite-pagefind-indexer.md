# T1: feat(vite): add Pagefind static indexer pipeline and build integration

**Issue:** #436
**Spec:** #435
**Status:** ready-for-agent
**Blocked by:** none

## Problem
Currently, SveltePress documentation sites rely on Algolia DocSearch. SveltePress lacks an automated static full-text search indexing step in its build pipeline.

## Solution
Integrate `pagefind` into `@sveltepress/vite` so that production builds automatically index static HTML output in `dist/`.

## Scope & Deliverables
1. Add `pagefind` dependency to the workspace (`@sveltepress/vite`).
2. Implement `indexSiteWithPagefind(siteRoot: string, outputDir: string, options?: PagefindOptions)` in `@sveltepress/vite`.
3. Hook into post-build (adapter-static completion or `sveltepress versions build`) to automatically trigger Pagefind indexing against `dist/`, generating `/pagefind/` static search assets.
4. Support exclusion of non-content elements via `data-pagefind-ignore` on navigation chrome (Navbar, Sidebar, Footer, VersionSelector) and `data-pagefind-body` on `<main>` content.
5. Add unit tests in `packages/vite/__tests__/pagefind.test.ts` verifying mock HTML indexing, output asset generation in `/pagefind/`, and HTML attribute handling.

## Acceptance Criteria
- `pnpm test:vite` passes with new Pagefind tests.
- Pagefind index files (`pagefind.js`, `pagefind-ui.js`, wasm, and shard fragments) are successfully emitted into the output directory.
