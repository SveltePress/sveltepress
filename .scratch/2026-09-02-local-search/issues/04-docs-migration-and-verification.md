# T4: docs: migrate docs-site to Local Search, verify production builds and update guides

**Issue:** #439
**Spec:** #435
**Status:** blocked
**Blocked by:** #438

## Problem
The official documentation site uses Algolia DocSearch. It should migrate to the new zero-config Local Search as a proof of functionality across locales and versions.

## Solution
Remove Algolia keys from `packages/docs-site/config/locales.ts`, update `scripts/check-version-management-build.mjs`, update user documentation, and create a Changeset.

## Scope & Deliverables
1. Remove Algolia `docsearch` config from `packages/docs-site/config/locales.ts`, letting the docs site run on the new default Local Search.
2. Update `scripts/check-version-management-build.mjs` to assert that `dist/pagefind/pagefind.js` exists and search works on built outputs across locales.
3. Update `packages/docs-site/src/routes/guide/default-theme/search/+page.md` and translated pages explaining the new zero-config Local Search and its options.
4. Add a Changeset for user-facing packages (`@sveltepress/vite`, `@sveltepress/theme-default`).

## Acceptance Criteria
- `pnpm check:versioning-build` succeeds and verifies generated Pagefind search assets.
- `pnpm check:docs` passes with updated documentation.
- Official documentation site successfully searches via Pagefind on production preview.
