# T3: feat(theme-default): wire LocalSearch as default in Navbar with DocSearch fallback

**Issue:** #438
**Spec:** #435
**Status:** blocked
**Blocked by:** #437

## Problem
The theme's Navbar currently renders DocSearch or a custom search component. It needs to mount `LocalSearch` by default while preserving backward compatibility with `themeOptions.docsearch`.

## Solution
Wire `LocalSearch` into `Navbar.svelte` and `NavbarMobile.svelte` as the fallback when `docsearch` is absent. Update `strip-versioning.ts` for manifestless sites.

## Scope & Deliverables
1. Update `Navbar.svelte` and `NavbarMobile.svelte`:
   - If `localeOptions.docsearch`: retain `@sveltepress/docsearch/Search.svelte` keyed by version and indexName.
   - If `localeOptions.search` is a custom component: render custom search.
   - Else (default): render `LocalSearch.svelte`.
2. Update `strip-versioning.ts` to ensure manifestless sites strip versioning cleanly and preserve LocalSearch mounting.
3. Update `manifestless-bundle.test.ts` reviewed source hashes.
4. Add tests covering default search, explicit docsearch, and custom search component rendering.

## Acceptance Criteria
- `pnpm test:theme-default` passes.
- Navbar renders `LocalSearch` when `docsearch` is not configured.
- Existing sites with `docsearch` keep functioning without regression.
