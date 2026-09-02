# T2: feat(theme-default): native Svelte 5 Local Search modal with multi-locale

**Issue:** #437
**Spec:** #435
**Status:** blocked
**Blocked by:** #436

## Problem
The default theme relies on `@docsearch/js` for search rendering. It needs a lightweight, native Svelte 5 search modal component driven by Pagefind's client API.

## Solution
Implement a native Svelte 5 modal component (`LocalSearch.svelte`) with UnoCSS styling, full keyboard navigation, dark mode synchronization, and active locale query filtering.

## Scope & Deliverables
1. Create `packages/theme-default/src/components/search/LocalSearch.svelte` using Svelte 5 runes (`$state`, `$derived`, `$effect`).
2. Style with UnoCSS and match the theme palette (`--svp-primary`) and dark/light mode seamlessly.
3. Keyboard accessibility:
   - Shortcut `Cmd+K` / `Ctrl+K` to toggle modal.
   - Arrow keys for navigation, Enter to open, Escape to close.
4. Client search driver:
   - Dynamically load `/pagefind/pagefind.js` at runtime when modal opens.
   - Filter queries by the active page's `lang` attribute by default.
   - Graceful fallback notice in dev mode when `pagefind.js` is not present.
5. i18n support:
   - Add `searchPlaceholder`, `searchNoResults`, `searchDevNotice` to theme i18n dictionaries for en, zh, bn.
6. Component tests in `packages/theme-default/__tests__/local-search.test.ts`.

## Acceptance Criteria
- `pnpm test:theme-default` passes with new local search component tests.
- Modal opens/closes properly via shortcut and button click.
- Language-specific query filtering and dictionary strings work as expected.
