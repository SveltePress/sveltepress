# DocSearch & Meilisearch Impact of i18n + Version Routing

**Status:** landing

## Requirement

> 检查当前实现的 i18n + 版本路由会对 docsearch 跟 meilisearch 造成什么影响

Audit the impact that the currently implemented i18n and version routing has on the DocSearch and Meilisearch search integrations, and fix any gaps the audit confirms.

## Problem Statement

The i18n feature (shipped on `feat/i18n`) merged the three documentation sites into one site with locale routing (English unprefixed, Chinese at `/zh/`, Bengali at `/bn/`), per-locale theme options, per-locale `llms.txt`, and a combined hreflang sitemap. Version management became per-locale: each locale owns a manifest whose `basePath` carries the locale prefix (`/v` for the default locale, `/zh/v`, `/bn/v`), producing historical routes such as `/v/2026-08-28/guide/` and `/zh/v/2026-08-28/guide/`.

Search was touched by both features, but the two *external-engine* integrations were written and documented before either landed:

- **DocSearch** (`@sveltepress/docsearch` + the theme `docsearch` option): per-locale `docsearch` configuration is now possible through per-locale theme options, and the Navbar gates DocSearch behind a per-version `search` metadata contract (`facetFilters`, `indexName` overrides) with a "search unavailable" notice on historical versions that have no such configuration. The official docs site itself no longer uses DocSearch (it migrated to built-in Local Search / Pagefind), so nothing in the repository dogfoods DocSearch on a locale- and version-routed site anymore.
- **Meilisearch** (`@sveltepress/meilisearch`, reached only through the theme's custom `search` component hook): the component queries one fixed index and ignores the `version` / `versionSearch` props the Navbar passes to custom search components; its documentation carries a self-described "known production build bug" (custom-search wrapper paths are not bundled in static production builds), which — if real — makes Meilisearch unavailable in exactly the production sites where it matters.

The user-facing search guide (`guide/default-theme/search`) predates i18n and version routing: it explains none of the locale/version indexing model (per-locale index + per-version facets), the historical-version "search unavailable" gate, or the URL scheme crawlers and indexes must produce (locale and version prefixes). The guide exists in English, Chinese, and Bengali, and the repository's documentation checks require the locale directories to mirror each other.

Nobody has checked what the shipped i18n + version routing actually does to DocSearch and Meilisearch. This spec ships that check — as a recorded, verifiable audit with fixes for the gaps it confirms.

## Solution

An impact audit with two outputs:

1. **A recorded audit.** Seven pre-registered claims (below) are each verified against the shipped code, generated outputs, and existing tests. Each claim gets a recorded verdict in this spec's `## Findings` section (`### F1` … `### F7`), stating impact (none / documented-only / code gap / docs gap) and any action taken. Claims that involve live Algolia or Meilisearch services are verified only as far as automated seams allow; live-service behavior is recorded as an explicitly unverified expectation.
2. **Fixes for confirmed gaps.** Where a claim's verification exposes a code or documentation gap, the gap is fixed with regression coverage at the seams recorded under Testing Decisions, and the user-facing search guide is updated — in English, Chinese, and Bengali, keeping the documentation parity checks green — to describe the locale/version-aware model: separate DocSearch index per locale + per-version `search` metadata (facets/overrides), the historical-version search gate, and prefixed record/result URLs for Meilisearch.

No real Algolia or Meilisearch services are used anywhere in this work; every acceptance criterion runs repository-local commands.

## Grill Decisions

1. **Deliverable — audit plus fixes.** The /ship ships both the recorded impact audit and fixes for the gaps the audit confirms (with regression tests). Report-only was offered and declined.
2. **Scope — DocSearch and Meilisearch.** Both integrations are audited: the theme `docsearch` option and `@sveltepress/docsearch`, and the custom `search` hook with `@sveltepress/meilisearch`. Built-in Local Search (Pagefind) is used only as a control for shared Navbar plumbing and is not changed.
3. **Verification — automated seams only.** No live Algolia/Meilisearch accounts or services. Acceptance is proven by repository-local unit/component tests, generated-output assertions, and the existing suites and checks.
4. **Documentation — all three locales.** Guide updates mirror across en/zh/bn to keep the repository's documentation parity checks green.
5. **Production custom-search bundling bug — verify, then fix as its own ticket.** The documented "known production build bug" for custom `search` components is verified first; if real, it is fixed in this ship as an independent ticket with its own acceptance. If the fix turns out to require an unbounded build-pipeline change, the spec is updated and the user is consulted rather than pushing through.
6. **DocSearch indexing model — per-locale index + per-version facets.** Guidance and fixtures assume one DocSearch index per locale (matching the pre-migration docs site and i18n decision 10) plus per-version `search` metadata (`indexName` / `facetFilters`) for historical versions.

## User Stories

1. As a SveltePress site author with an existing Algolia DocSearch configuration, I want to know whether enabling i18n locales and version management breaks my search, so that I can upgrade without losing site search.
2. As a site author running a locale- and version-routed site, I want search results confined to the active locale and version, so that a reader on `/zh/v/<id>/guide/` never lands on English current-version content.
3. As a site author running historical versions, I want the search UI to reflect per-version search configuration (facets or a clear "unavailable" notice), so that a version without a matching index never queries the current index.
4. As a site author using Meilisearch through the custom search hook, I want my component to receive the active version context and my guide to show how record URLs must carry locale and version prefixes, so that result clicks land on real pages.
5. As a maintainer, I want the documented "production custom-search bundling bug" verified and, if real, fixed, so that Meilisearch (and any custom engine) works in static production builds.
6. As a maintainer, I want the search guide updated in all three languages so that documented behavior matches shipped behavior for locale- and version-routed sites.

## Claims Under Audit

Each claim is verified during landing and recorded in `## Findings` as `### F1` … `### F7` with a verdict. Claims C2–C4 and C6 are expected code-correctness checks; C1, C5, and C7 are expected documentation-gap checks.

- **C1 — Per-locale DocSearch configuration.** The theme resolves `docsearch` from the active locale's theme options (merged over site options); the Navbar remounts the DocSearch widget when the resolved index or version changes. Verify: the merge and remount-key behavior are covered by tests; per-locale `indexName` is expressible. Expected verdict: works as designed; documentation gap only.
- **C2 — Historical-version search gate.** `resolveVersionSearch` reports search unavailable on historical routes whose version has no `search` metadata, and the Navbar merges `facetFilters` / overrides from that metadata when present. Verify: the gate is exercised in tests; none of the three docs-site manifests currently carries `search` metadata, so every historical route on the docs site shows the "Search is not available for this documentation version." notice. Expected verdict: matches the version-management design; documentation gap only.
- **C3 — Crawler-facing URL surface.** The combined locale+version sitemap lists every current locale route (hreflang alternates across locales) and every eligible historical version route per locale (`/v/<id>/…`, `/zh/v/<id>/…`, `/bn/v/<id>/…`, hreflang across locales sharing the version), excluding EOL history unless `noIndex: false`. Verify with unit tests over `generateLocaleVersionSitemap` and generated fixture output. Expected verdict: correct (no code gap); regression test may be added where coverage is thin.
- **C4 — Canonical and robots per page.** Current and historical pages emit `rel="canonical"`; historical EOL pages emit `noindex` unless the version opts out. Verify in the versioned runtime and the manifestless transform. Expected verdict: correct; documentation of the crawler implications may be needed.
- **C5 — Custom search component contract.** The Navbar renders a custom `search` component only when search is available for the route, remounts it per version, and passes it `version` and `versionSearch` (per-version metadata) props — but passes no locale prop, and `@sveltepress/meilisearch` consumes neither prop and applies no version/locale filtering. Verify the props contract and the component's behavior; the guide must explain locale/version handling for custom engines. Expected verdict: code works as designed but is under-documented and the shipped Meilisearch component is not version/locale aware as documented behavior implies.
- **C6 — Production custom-search bundling.** The search guide documents that a custom `search` wrapper referenced by source path is not bundled in static production builds and that component objects do not survive theme-option serialization. Verify against the shipped runtime and a production build fixture; if confirmed, fix so a custom-search wrapper is bundled and functional in production, with a regression test at the bundle seam.
- **C7 — Guide accuracy across locales.** The search guide (en/zh/bn) must describe the locale/version-aware model and stay parity-green. Verify with the documentation content check after updating.

## Implementation Decisions

- The audit is claim-driven: `## Findings` records one `### F` entry per claim, each with verdict, evidence (test or output), and action. The spec file — not this conversation — is the working memory; findings and decisions update it before code changes of consequence.
- No new public framework API is introduced unless a verified gap requires one. The intended mechanism for any C6 fix is a build-time resolution of the custom-search module reference so the wrapper is part of the production client bundle, without changing the `search` option shape (`Component | string | boolean`).
- DocSearch model codified in docs: one Algolia index per locale (`indexName` from that locale's theme options; e.g. `sveltepress` / `cn` / `sveltepress` for the merged docs site's historical configuration) and, for historical versions, per-version `search` metadata (`facetFilters` such as `version:2026-08-28`, optionally an `indexName` override) recorded in that locale's manifest. The theme's existing merge path (base `docsearch` config + metadata `facetFilters`/overrides) is the contract.
- Meilisearch model codified in docs: the wrapper component receives `version` and `versionSearch` props from the theme and is responsible for applying version (and, if the site uses one index per locale, locale) filtering itself; indexed records' `url`/`path` values must be the real prefixed routes (`/zh/…`, `/v/<id>/…`).
- Findings that change a decision update this spec first; acceptance criteria are never weakened, only superseded by a spec update that the user has approved.

## Testing Decisions

A good test here asserts externally observable behavior at public seams: generated files and bundle contents for the core/build layer, and rendered component behavior for the theme. Internal helpers are tested only through those seams.

Recorded seams (three, kept minimal):

- **Core output seam (`packages/vite/__tests__/`)** — generated sitemap for locale+versioned sites. Prior art: `locale-outputs.test.ts` (`combined locale and version sitemap output`, including `/v/<id>/…` and `/zh/v/<id>/…` historical entries with per-locale alternates and EOL exclusion) already covers claim C3; the audit adds no new core test file and records that coverage as its evidence.
- **Theme search runtime seam (`packages/theme-default/__tests__/`)** — Navbar search behavior and SEO meta: `search-routing.test.ts` covers DocSearch vs custom vs Local resolution, per-version metadata merge (`facetFilters`, overrides), remount keys, historical "unavailable" notice, and the custom-search props contract; `seo-meta.test.ts` covers PageLayout `rel="canonical"` and `noindex` output for current, historical stable, and EOL pages. Prior art: `version-components.test.ts` and `local-search.test.ts` render `Navbar`/`PageLayout` through the fixture virtual modules.
- **Bundle seam (`packages/theme-default/__tests__/`)** — for C6, the production bundle of a site with a custom `search` wrapper must include the wrapper. Prior art: `manifestless-bundle.test.ts` already builds a production bundle without a version manifest; the C6 regression extends that approach (or adds a sibling fixture test).

## Out of Scope

- Live verification against real Algolia DocSearch or Meilisearch services, and any crawler-side / index-side configuration on the platform.
- Changing built-in Local Search (Pagefind) behavior; it appears only as a control.
- A single shared-index-with-facets DocSearch model for multi-locale sites (guidance documents both, recommends per-locale indices).
- i18n/version support in `@sveltepress/theme-blog` search.
- New search features beyond making the existing DocSearch/Meilisearch integrations correct and accurately documented.
- Closing out the unrelated `2026-09-02-local-search` spec (Status `approved`, all tickets ticked) — noted here as left open for a separate /ship.

## Findings

### F3 — Crawler-facing sitemap surface (claim C3)

**Verdict:** no impact — correct as shipped; already covered by existing tests.
**Evidence:** `packages/vite/__tests__/locale-outputs.test.ts` ("combined locale and version sitemap output") asserts current `/zh/…` entries, historical `/v/v8/guide/` and `/zh/v/v8/guide/` entries, hreflang alternates only across locales sharing the same version and route, EOL exclusion by default, and EOL inclusion when `noIndex: false`. Baseline `pnpm test` (vite: 27 files / 168 tests) green.
**Action:** none (no new core test file; coverage already exists).

### F4 — Canonical and robots per page (claim C4)

**Verdict:** no impact — correct as shipped.
**Evidence:** new `packages/theme-default/__tests__/seo-meta.test.ts` (4/4 green): `rel="canonical"` on current and historical pages, `noindex,follow` on EOL history by default, and no `noindex` when the EOL version sets `noIndex: false`.
**Action:** regression coverage added for the versioned runtime (ticket T1); the no-manifest path is covered by the existing manifestless bundle transform tests.

### F1 — Per-locale DocSearch configuration (claim C1)

**Verdict:** no impact — works as designed.
**Evidence:** `packages/theme-default/__tests__/search-routing.test.ts` (docsearch tests, 7/7 suite green): the site-level `docsearch` config mounts the widget; a locale whose theme options set a different `docsearch.indexName` takes over on its prefixed routes (Navbar keys the widget by `${versionId}:${indexName}`, so the locale switch remounts it with the new index).
**Action:** none in code; guide (ticket T4) should tell authors to give each locale its own `indexName` (or accept the remount on index change).

### F2 — Historical-version search gate (claim C2)

**Verdict:** no impact — as designed; the gate is real and must be documented.
**Evidence:** `search-routing.test.ts`: on `/v/2026-08-27/guide/` (no per-version `search` metadata) the Navbar shows the "unavailable" notice and mounts neither DocSearch nor custom search; a version whose manifest carries `search: { indexName, facetFilters }` gets those merged over the locale's docsearch config (widget re-keys to the override index with the facet filter).
**Action:** none in code; note that none of the three docs-site manifests carries `search` metadata today, so every historical route on the official site shows the notice; guide (T4) documents how to configure per-version search.

### F5 — Custom search component contract (claim C5)

**Verdict:** no code impact — the contract works; responsibilities are under-documented and the shipped Meilisearch component is not version/locale aware.
**Evidence:** `search-routing.test.ts`: custom components are gated by `versionSearch.available`, remounted per version, and receive `version` + per-version `search` metadata; a custom component takes precedence over `docsearch`. The Navbar passes **no locale prop** — a custom engine must read the pathname itself — and `@sveltepress/meilisearch` consumes neither prop.
**Action:** guide (T4) states the wrapper responsibilities (apply version facets / locale filtering from `versionSearch`, use prefixed record URLs).

## Acceptance Criteria

Each criterion names the exact command that proves it and the output that counts as passing. All commands run from the repository root on branch `feat/i18n`.

1. **Audit findings recorded.** Command: `test "$(grep -cE '^### F[0-9]+ — ' docs/superpowers/specs/2026-09-02-search-i18n-version-impact.md)" -ge 7 && echo "findings: $(grep -cE '^### F[0-9]+ — ' docs/superpowers/specs/2026-09-02-search-i18n-version-impact.md)"`. Passing: prints `findings: 7` or more, with each `### F1`–`### F7` entry carrying a verdict line (`Verdict:`).
2. **SEO meta coverage passes.** Command: `pnpm --dir packages/theme-default test seo-meta.test.ts`. Passing: vitest exits 0; the suite asserts `rel="canonical"` on current and historical pages and `noindex` on EOL history unless the version opts out. (The sitemap half of C3 is proven by the existing `locale-outputs.test.ts` combined sitemap coverage, cited in finding F3; the no-manifest case is the manifestless bundle path covered by `manifestless-bundle.test.ts`.)
3. **Theme search runtime coverage passes.** Command: `pnpm --dir packages/theme-default test search-routing.test.ts`. Passing: vitest exits 0; the suite asserts DocSearch/custom/Local resolution, per-version `facetFilters` merge and overrides, remount keys, the historical "unavailable" notice, and the custom-search props contract.
4. **Custom-search production bundling regression passes.** Command: `pnpm --dir packages/theme-default test custom-search-bundle.test.ts`. Passing: vitest exits 0; the suite's production-bundle assertion shows the custom search wrapper module present in the built client (fix for C6) or, if C6 was disproven, documents the disproving output in the finding.
5. **Vite suite green.** Command: `pnpm test:vite`. Passing: vitest exits 0 with all tests passing.
6. **Theme suite green.** Command: `pnpm test:theme-default`. Passing: vitest exits 0 with all tests passing.
7. **Documentation parity green.** Command: `pnpm check:docs:content`. Passing: exits 0 with no failures; the en/zh/bn search guides mirror each other and describe the locale/version-aware model.
8. **Full suite green.** Command: `pnpm test`. Passing: all suites (scripts, cli, vite, theme-default, theme-blog) exit 0.

## Plan

- [x] **T1 — SEO & sitemap surface audit (claims C3, C4).** Delivers: `packages/theme-default/__tests__/seo-meta.test.ts` asserting PageLayout `rel="canonical"` and `noindex` output for current, historical stable, and EOL pages (with opt-out); the sitemap half of C3 is proven by the existing `locale-outputs.test.ts` combined locale+version coverage (no new core file); findings `### F3`, `### F4` recorded in this spec with verdicts. Blocked by: nothing.
- [x] **T2 — Theme search runtime audit (claims C1, C2, C5).** Delivers: `packages/theme-default/__tests__/search-routing.test.ts` covering per-locale `docsearch` resolution and remount keys, the historical-version search gate and "unavailable" notice, per-version `facetFilters`/overrides merge, and the custom-search props contract (`version`, `versionSearch`); findings `### F1`, `### F2`, `### F5` recorded. Blocked by: nothing.
- [ ] **T3 — Custom-search production bundling (claim C6).** Delivers: reproduction of the documented production-bundling gap for custom `search` wrappers; if confirmed, a build-time fix so the wrapper is part of the production client bundle, plus `packages/theme-default/__tests__/custom-search-bundle.test.ts` regression at the bundle seam and a changeset; finding `### F6` recorded. If the fix's scope balloons beyond the bundle seam, the spec is updated and the user consulted. Blocked by: nothing.
- [ ] **T4 — Guide updates across locales (claim C7; C5 responsibilities).** Delivers: en/zh/bn `guide/default-theme/search` updated to the locale/version-aware model (per-locale DocSearch index + per-version `search` metadata; historical-version gate; Meilisearch record URL prefixes and wrapper responsibilities for `version`/`versionSearch`), keeping the documentation parity check green; finding `### F7` recorded. Blocked by: T2, T3 (guide wording depends on their evidence).

## Baseline

Proof commands run on the unmodified tree at gate 2 (2026-09-02, branch `feat/i18n`); all green unless noted. New test files named in the acceptance criteria (`seo-meta.test.ts`, `search-routing.test.ts`, `custom-search-bundle.test.ts`) do not exist yet at baseline; each appears with its ticket.

1. `git status --short` → only the untracked spec file `docs/superpowers/specs/2026-09-02-search-i18n-version-impact.md`; no unrelated changes.
2. `pnpm test` → all suites pass, exit 0: scripts 2 files / 40 tests; cli 2 files / 31 tests; vite 27 files / 168 tests; theme-default 19 files / 110 tests; theme-blog 14 files / 75 tests.
3. `pnpm check:docs:content` → vitest docs config 1 file / 2 tests passed; "Documentation checks passed for 30 pages across 3 locales.", exit 0.
