# Document version management implementation tickets

**Parent specification:** GitHub Issue #418

## 1. Add the headless version manifest and route contract (#419)

**Blocked by:** None.

Deliver manifest discovery and validation, dotted version-route support, logical route resolution, version target availability, missing-page fallback data, and a public virtual-module contract for custom themes. A site with a valid hand-authored manifest can build and consume version context; a site without one is unchanged.

## 2. Provide the safe version lifecycle CLI (#420)

**Blocked by:** #419.

Deliver the `@sveltepress/cli` package with `versions init`, `create`, `list`, and `validate`. The commands enforce route/ID conflicts, dirty-worktree policy, atomic updates, duplicate protection, and observable exit codes. A maintainer can initialize a real site and cut a new current version from the terminal.

## 3. Preserve historical content, links, and sidebars (#421)

**Blocked by:** #419 and #420.

Deliver full route-directory snapshots, include/exclude/shared boundaries, strict external-dependency checks, route inventories, resolved historical sidebar metadata, and version-aware internal links. A historical tree remains internally navigable and validation identifies every deliberate shared dependency.

## 4. Add accessible version navigation to Default Theme (#422)

**Blocked by:** #421.

Deliver a desktop and mobile version selector with keyboard behavior, current-label display, same-page switching, route-availability checks, and a clear target-version home fallback. A reader can move safely between versions without leaving the selected documentation context.

## 5. Surface lifecycle status and historical source links (#423)

**Blocked by:** #422.

Deliver localized deprecated/EOL banners, current-version recovery links, lifecycle-aware selector presentation, snapshot edit links, source-ref overrides, and optional EOL edit suppression.

## 6. Isolate search by documentation version (#424)

**Blocked by:** #422.

Deliver version context to search adapters, per-version search metadata, and an explicit unavailable state when a historical index is absent. A search initiated in one version cannot silently return another version's results.

## 7. Separate version-aware build outputs (#425)

**Blocked by:** #419 and #421.

Deliver self-canonical version pages, lifecycle-aware sitemap behavior, one `llms.txt` per version, and current-only PWA precache with on-demand historical caching.

## 8. Dogfood and release document version management (#426)

**Blocked by:** #423, #424, and #425.

Document the public CLI, manifest, core module, theme UI, lifecycle, search, and output behavior across all maintained documentation sites. Initialize the official English site, create a real historical snapshot, run the complete acceptance matrix, add accurate Changesets, and deliver through the ordinary release workflow.
