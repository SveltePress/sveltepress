# Spec: Faster PWA Refresh Prompt on Large Docs Sites

Status: landing
Branch: ship/pwa-faster-update-prompt
Base-Commit: 84b431ade8731989d9996bafc92e98e2a5da6180
Original-Branch: main

## Requirement

当文档站点的 PWA 检索资源过多，导致站点更新要很久才能弹出 paw refresh 的弹窗，优化

## Problem Statement

On a documentation site that enables the Default Theme PWA, a new deploy does not show the refresh toast until the new service worker finishes installing and reaches the `waiting` state. HTML precache is already homepage-only, but the default Workbox glob still matches every hashed client file under `.svelte-kit/output/client` — on the official docs site that is on the order of eight hundred files (hundreds of per-route SvelteKit nodes plus shared chunks, some several hundred kilobytes). Workbox must hash, compare, and download that set before `needRefresh` becomes true, so the “New content available” prompt appears long after the site has been updated.

The toast itself is not the bottleneck. Users wait because install is too large.

## Solution

Shrink the default client precache to an app shell so the new service worker can become `waiting` quickly. Keep the existing click-to-reload toast: it still appears only after the worker is waiting; the user still clicks Reload. Per-route JavaScript and hashed chunks are no longer part of install. They are fetched when a route is visited and stored with a capped CacheFirst runtime cache. Sites that still want every client file in the precache opt in with `pwa.precacheClient: true`. `pwa.precachePages` continues to control HTML only.

First-install homepage hydration may need the network (or a later visit that fills the runtime cache). Visited pages, including home after one online load, remain available offline through runtime caching.

## Grill Decisions

1. **Success criterion is a smaller precache, not toast chrome.** The delay is Workbox install of ~831 client files. Optimization is cutting per-route nodes and chunks out of the precache so `waiting` happens sooner. An “updating…” toast or auto-reload does not shrink install.
2. **Applies to every Default Theme PWA site.** The glob lives in `@sveltepress/theme-default` and is used by both `injectManifest` (theme default) and `generateSW` (docs-site). Changing the theme default is the fix; a docs-site-only override would leave other large sites slow.
3. **ReloadPrompt UX stays click-to-reload after waiting.** No auto-activate, no extra “updating…” state. The win is that `waiting` arrives sooner.
4. **Default membership is app shell, not “keep chunks / drop nodes”.** Shared chunks still number in the hundreds and include large highlighter/twoslash files. Shell-only is the only cut that makes install cheap.
5. **Escape hatch is a new flag, not a reuse of `precachePages`.** `pwa.precacheClient: true` restores today’s `client/**/*.{js,css,…}` glob. Default omitted/`false` is shell-only. HTML policy stays on `precachePages`.
6. **Excluded hashed modules use CacheFirst.** `_app/immutable/**` URLs are content-hashed. CacheFirst with expiration is the runtime strategy. NetworkFirst would slow repeat visits; relying on HTTP cache alone would drop SW offline for those files.
7. **Shell is defined by globs, not the Vite client manifest.** Vite marks every page node as an entry. The real start/app static graph is a handful of files, but Workbox only sees globs. Parsing `.vite/manifest.json` is out of scope. Default globs: entry JS/CSS, hashed CSS/fonts under assets, root icons. No `nodes/**`, no `chunks/**`.
8. **First-install homepage hydration may need network.** Layout and homepage node modules are dynamic imports. They are not in the shell glob. After one online visit they live in the runtime cache.
9. **Runtime cache cap is 400 entries and 30 days.** High enough that a heavy reading session does not immediately evict recent modules; low enough that unused hashes expire. Same 30-day age as the existing image cache.
10. **The CacheFirst immutable rule is registered only when client precache is shell-only on generateSW.** When `precacheClient: true`, generateSW omits that runtime rule. The injectManifest service worker file is static, so it may still register CacheFirst; Workbox serves precache first, so the extra rule is redundant rather than wrong.

## User Stories

1. As a documentation reader on a PWA-enabled site, I want the refresh toast soon after a deploy, so that I can reload into new content without waiting for hundreds of unused page modules to download.
2. As a documentation reader, I want to click Reload on that toast myself, so that a background update does not yank the page while I am reading.
3. As a documentation reader who already visited a page online, I want that page’s hashed modules to be served from cache on later visits, so that repeat navigation stays fast and works offline.
4. As a documentation reader who has never visited a given page, I want that page’s JavaScript fetched on demand, so that a site update does not download every locale and version module up front.
5. As a documentation reader on first PWA install, I accept that homepage hydration may need the network until those modules have been cached, so that service-worker install stays small.
6. As a site author using the Default Theme PWA, I want shell-only client precache by default, so that versioned and multilingual docs sites update promptly without extra config.
7. As a site author who wants the previous “cache every client file” behavior, I want `pwa.precacheClient: true`, so that I can restore a fully precached client without forking Workbox globs by hand.
8. As a site author who already configured `pwa.precachePages`, I want HTML precache policy unchanged, so that homepage-only / prefix / full-HTML choices keep working.
9. As a site author using `generateSW` (as the official docs site does), I want the same shell glob and the same CacheFirst rule as `injectManifest` sites, so that strategy choice does not reintroduce a huge precache.
10. As a site author who sets `precacheClient: true` with `generateSW`, I want the extra immutable CacheFirst rule omitted, so that runtime caching is not duplicated on top of a full client precache.
11. As a docs reader of the PWA guide in English, Chinese, or Bengali, I want the new default and `precacheClient` documented, so that I know why install is small and how to restore the old client glob.

## Implementation Decisions

- Own the change in `@sveltepress/theme-default`. The official docs site keeps using the theme’s PWA defaults; it does not override client globs in its PWA config.
- Extend the existing precache-pattern helper (the module that already builds `globPatterns` from `precachePages`) so it also takes `precacheClient` and returns the combined Workbox glob list. Keep HTML and client policies orthogonal: `precachePages` still decides prerendered HTML; `precacheClient` decides client files.
- Default `precacheClient` is `false` / omitted. Shell client globs are:
  - `client/_app/immutable/entry/**/*.{js,css}`
  - `client/_app/immutable/assets/**/*.{css,otf,woff,woff2}`
  - `client/*.{ico,png,svg,webp}`
- `precacheClient: true` restores the current catch-all client glob `client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}`.
- A glob starting with `prerendered/` remains mandatory so `@vite-pwa/sveltekit` does not append its catch-all HTML/JSON glob.
- Do not parse the Vite client manifest. Do not special-case layout node `0` or the start/app chunk closure.
- When client precache is shell-only, register a CacheFirst runtime rule for URLs whose pathname includes `/_app/immutable/`, cache name `sveltepress-immutable`, expiration `maxEntries: 400` and `maxAgeSeconds: 30 * 24 * 60 * 60`, cacheable status `200`. Place it with the existing runtime rules (after author `runtimeCaching`, alongside page/data/image rules).
- When `precacheClient: true`, omit that runtime rule from `workbox.runtimeCaching` (generateSW). The injectManifest service worker source may keep a matching CacheFirst route unconditionally because that file is not parameterized; precache still wins for files already in `__WB_MANIFEST`.
- `ReloadPrompt` / `Prompt` stay as they are: toast when `needRefresh` or `offlineReady`; Reload calls `updateServiceWorker(true)`.
- Publish `precacheClient` on the Default Theme PWA options type next to `precachePages` and `darkManifest`.
- Document the new default and the flag on the PWA guide in English, Chinese, and Bengali. Mention that first-install homepage hydration may need the network until hashed modules have been runtime-cached. Do not freeze a new docs version for this change; it is a current-docs clarification of existing PWA behavior.
- Author a **minor** Changeset for `@sveltepress/theme-default` (new public option and a changed default, same class as `precachePages`).

## Testing Decisions

A good test here asserts the **public Workbox configuration** the theme hands to `@vite-pwa/sveltekit`, plus the static injectManifest service worker source — not Workbox internals, not a browser install, not Vite manifest parsing.

**Seam (one):** the existing Default Theme PWA tests. They construct `defaultTheme({ pwa })`, run `vitePlugins` with a dummy core plugin, and inspect the captured `SvelteKitPWA` options (`injectManifest.globPatterns`, `workbox.globPatterns`, `workbox.runtimeCaching`). The injectManifest worker is asserted by reading the theme’s `sw.js` source. Extend that seam; do not add a second one.

Prior art: `packages/theme-default/__tests__/pwa-options.test.ts` and `packages/theme-default/__tests__/pwa-precache-pages.test.ts`.

Focused proofs:

- Default globs include the three shell client patterns and homepage HTML, and **exclude** `client/**/*.{js,css,…}`, `nodes/**`, and `chunks/**`.
- `precacheClient: true` restores the catch-all client glob.
- `precachePages` still controls HTML independently of `precacheClient`.
- Shell-only default registers CacheFirst `sveltepress-immutable` with 400 / 30-day expiration; `precacheClient: true` omits that rule from `workbox.runtimeCaching`.
- `sw.js` registers CacheFirst for `_app/immutable` with the same cap.
- Existing navigate-fallback and HTML-precache assertions remain green.
- PWA guide pages in `/`, `/zh/`, and `/bn/` mention `precacheClient`.

Do not require a Playwright service-worker install as an acceptance command: it is slow, environment-heavy, and not an existing seam.

## Out of Scope

- Changing ReloadPrompt copy, auto-reload, or an “updating…” intermediate toast.
- Precaching Pagefind indexes, historical version HTML, or `__data.json`.
- Parsing the Vite client manifest to include the start/app static chunk closure or layout node `0`.
- Raising or removing runtime cache caps on pages, `__data.json`, or images.
- Per-locale PWA manifests.
- Freezing a new documentation version.
- Changing `@vite-pwa/sveltekit` itself or requiring authors to switch strategies.

## Acceptance Criteria

1. Default client precache is shell-only and HTML remains homepage-only.
   Command: `pnpm --filter @sveltepress/theme-default exec vitest run __tests__/pwa-precache-pages.test.ts __tests__/pwa-options.test.ts`
   Pass: exit code 0; default `globPatterns` contain the entry / assets / root-icon globs and `prerendered/pages/index.html`, and do not contain `client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}` or a `nodes/**` / `chunks/**` glob.

2. `precacheClient: true` restores the previous catch-all client glob; `precachePages` still selects HTML independently.
   Command: same as criterion 1.
   Pass: exit code 0; a case with `precacheClient: true` includes `client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}`; prefix / full HTML cases still match the existing `precachePages` contract.

3. Shell-only generateSW registers CacheFirst for `/_app/immutable/` with 400 entries and 30-day max age; full client precache omits that workbox runtime rule.
   Command: same as criterion 1.
   Pass: exit code 0; default captured `workbox.runtimeCaching` includes `cacheName: 'sveltepress-immutable'` with those expiration values; `precacheClient: true` does not include that cache name.

4. The injectManifest service worker registers CacheFirst for `_app/immutable` with the same cap.
   Command: same as criterion 1 (the existing `sw.js` source assertion in `pwa-options.test.ts`).
   Pass: exit code 0; `sw.js` contains `_app/immutable`, `CacheFirst`, `sveltepress-immutable`, `maxEntries: 400`.

5. PWA guides in English, Chinese, and Bengali document `precacheClient`.
   Command: `python3 -c "from pathlib import Path; roots=['packages/docs-site/src/routes/guide/default-theme/pwa/+page.md','packages/docs-site/src/routes/zh/guide/default-theme/pwa/+page.md','packages/docs-site/src/routes/bn/guide/default-theme/pwa/+page.md'];
import sys
missing=[p for p in roots if 'precacheClient' not in Path(p).read_text()]
sys.exit(1 if missing else 0)"`
   Pass: exit code 0 (every locale page contains `precacheClient`).

6. Theme-default PWA tests and the repository test suite have no new failures versus baseline.
   Command: `pnpm test`
   Pass: exit code 0, or only failures already recorded in Baseline.

The repository has no `pnpm run typecheck` script. Global guardrail for this change is `pnpm test`. Docs content check `pnpm check:docs:content` is run during landing if PWA guide pages change, but is not a named acceptance command beyond criterion 5.

## Plan

- [x] Ticket 1: Shell client precache glob — Delivers `precacheClient` on the glob helper and theme PWA options: default globs are entry + assets + root icons + existing HTML policy; `true` restores `client/**/*.{js,css,…}`; no nodes/chunks catch-all. Tests at pwa-precache-pages.test.ts and pwa-options.test.ts globPatterns. (Blocked by: none)
- [x] Ticket 2: Immutable CacheFirst runtime — Delivers generateSW `sveltepress-immutable` CacheFirst (400 / 30d) when shell-only, omitted when `precacheClient: true`; injectManifest `sw.js` registers the same route. Tests at pwa-options.test.ts runtimeCaching + sw.js source. (Blocked by: Ticket 1)
- [x] Ticket 3: Release & Documentation Compliance — Delivers Changeset (minor on `@sveltepress/theme-default`) and PWA guide updates in EN / ZH / BN documenting `precacheClient` and the first-install hydration tradeoff. Root README has no PWA glob section to update. (Blocked by: Tickets 1–2)

## Ticket verification

### Ticket 1 red proof

`pnpm --filter @sveltepress/theme-default exec vitest run __tests__/pwa-precache-pages.test.ts __tests__/pwa-options.test.ts` — exit 1. 6 failed / 10 passed. Failures are assertion mismatches: received `client/**/*.{js,css,…}` where shell globs (`entry/**`, `assets/**`, `client/*.{ico,png,svg,webp}`) were expected. `precacheClient: true` cases already match today’s catch-all (pass for the old default).

### Ticket 1 green proof

Same command — exit 0, 16 passed (9 + 7). Theme-default suite: 176 passed.

### Ticket 2 red proof

Same command — exit 1. 2 failed / 15 passed. Default captured `workbox.runtimeCaching` had no `sveltepress-immutable`; `sw.js` did not contain `_app/immutable`.

### Ticket 2 green proof

Same command — exit 0, 17 passed (10 + 7).

### Ticket 3 red proof

Criterion 5 at baseline: `precacheClient` missing from EN/ZH/BN PWA guides (exit 1).

### Ticket 3 green proof

Same python token check — exit 0 after EN/ZH/BN PWA guide updates. Minor changeset `.changeset/pwa-faster-update-prompt.md` added for `@sveltepress/theme-default`.

## Baseline

Recorded on `ship/pwa-faster-update-prompt` at `84b431ade8731989d9996bafc92e98e2a5da6180` before implementation. Working tree contained only this spec file.

- Criterion 1–4 command `pnpm --filter @sveltepress/theme-default exec vitest run __tests__/pwa-precache-pages.test.ts __tests__/pwa-options.test.ts` — GREEN on the **current** contract: 14 tests passed (8 + 6). Default glob still includes `client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}` and homepage HTML. No `precacheClient`, no `sveltepress-immutable` rule. This is the pre-change baseline; Ticket 1 will turn the default-glob assertions red, then green.
- Criterion 5 (`precacheClient` in EN/ZH/BN PWA guides) — RED (exit 1). Missing: all three locale pages. Expected until Ticket 3.
- Criterion 6 `pnpm test` — GREEN: scripts 40, cli 34, vite 185, theme-default 174, theme-blog 75, twoslash 6. Zero failures.
- `pnpm run typecheck` does not exist in this repository. Global guardrail is `pnpm test`.
