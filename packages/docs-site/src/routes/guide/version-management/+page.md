---
title: Document version management
---

SveltePress can keep the latest documentation at its normal URLs while publishing immutable historical snapshots below a version prefix such as `/v/8.1/`. Version management is opt-in: sites without a `sveltepress.versions.json` manifest behave exactly as before.

## Install and initialize

Install the CLI beside the Vite plugin and theme:

```sh
pnpm add -D @sveltepress/cli
```

Initialize version management with the version currently served by your site:

```sh
pnpm exec sveltepress versions init --current 8.1 --label "8.1"
```

This creates `sveltepress.versions.json`. The Vite plugin discovers that file automatically; use `sveltepress({ versions: false })` to disable discovery or `sveltepress({ versions: { manifest: 'path/to/versions.json' } })` to select another manifest.

## Enable incremental artifacts

Existing sites can migrate their committed snapshot directories once. New sites can run the same command immediately after `versions init`:

```sh
pnpm exec sveltepress versions migrate --site-id docs-example
```

Migration replaces full `src/routes/v/{id}` copies with committed `version-deltas/{id}` source deltas and initializes a content-addressed page store under `.sveltepress/version-artifacts`. The store is a build cache; commit the source deltas and restore/cache the artifact store in CI.

Use the incremental command as the production build script:

```json
{
  "scripts": {
    "build": "sveltepress versions build"
  }
}
```

`versions plan` reports compiled, reused, removed, and recomposed routes without building. `versions build` restores missing historical artifacts from committed deltas, compiles only changed current pages, composes the stable SveltePress shell, and then runs the normal Vite production build. A shell or index change may recompose routes without recompiling unchanged page content; a page compiler or artifact schema change intentionally invalidates every page artifact.

For GitHub Actions, restore the newest compatible store before the build and save the updated store under the current commit key:

```yaml
- uses: actions/cache@v4
  with:
    path: .sveltepress/version-artifacts
    key: sveltepress-pages-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      sveltepress-pages-${{ runner.os }}-
- run: pnpm build
```

Use the equivalent persistent-cache facility on other CI providers. Do not share a store between different `siteId` values.

Generated page modules, including Default Theme LiveCode components, are embedded in their owning page artifacts. Cache only `.sveltepress/version-artifacts`; `.sveltepress/live-code` is a local development directory and is not required when a CI worker restores reusable pages.

## LiveCode artifact self-check

This page dogfoods that behavior. The interactive component below is generated from this Markdown file, embedded in the page artifact, and server-rendered again after the local `.sveltepress/live-code` directory is removed. If the card renders and its button responds, both the reusable artifact and client hydration paths are working.

```svelte live
<script>
  let interactions = $state(0)
  const checks = [
    'Generated module embedded',
    'Server render complete',
    'Client hydration ready',
  ]
</script>

<section class="artifact-check" data-version-artifact-live-code>
  <div class="artifact-check__status" aria-hidden="true">✓</div>
  <div class="artifact-check__content">
    <p class="artifact-check__eyebrow">LIVE DOCUMENTATION CHECK</p>
    <h3>Artifact self-check passed</h3>
    <ul>
      {#each checks as check}
        <li><span aria-hidden="true">✓</span>{check}</li>
      {/each}
    </ul>
    <button type="button" onclick={() => interactions++}>
      Test interaction{interactions ? ` · ${interactions}` : ''}
    </button>
  </div>
</section>

<style>
  .artifact-check {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    overflow: hidden;
    padding: 1.25rem;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: 1rem;
    background:
      radial-gradient(circle at 100% 0%, rgb(255 94 122 / 18%), transparent 45%),
      color-mix(in srgb, currentColor 4%, transparent);
  }

  .artifact-check__status {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    border-radius: 0.85rem;
    color: #14231a;
    font-size: 1.4rem;
    font-weight: 800;
    background: #70e19b;
    box-shadow: 0 0 0 0.35rem rgb(112 225 155 / 12%);
  }

  .artifact-check__content h3,
  .artifact-check__content p {
    margin: 0;
  }

  .artifact-check__eyebrow {
    color: #ff5e7a;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  .artifact-check__content h3 {
    margin-top: 0.15rem;
    font-size: 1.2rem;
  }

  .artifact-check__content ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.85rem 0;
    padding: 0;
    list-style: none;
  }

  .artifact-check__content li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.55rem;
    border-radius: 999px;
    font-size: 0.78rem;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .artifact-check__content li span {
    color: #45c97c;
    font-weight: 800;
  }

  .artifact-check__content button {
    padding: 0.55rem 0.8rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 0.65rem;
    color: inherit;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    background: transparent;
    cursor: pointer;
  }

  .artifact-check__content button:hover {
    border-color: #ff5e7a;
  }
</style>
```

## Create a release snapshot

:::since[Advance before editing the next version]{version="2026-08-31" id="next-version-doc-workflow" summary="Freeze outgoing docs before editing and marking the new current version."}
Start from clean, complete outgoing documentation. Build and create the next version before editing its pages or adding its `:::since` markers. `create` freezes the outgoing current version and makes the supplied ID current; only then should new documentation use that ID.

```sh
pnpm exec sveltepress versions build
pnpm exec sveltepress versions create 8.2 --label "8.2"

# 8.2 is now current: edit docs and add version="8.2" markers

pnpm exec sveltepress versions build
pnpm exec sveltepress versions validate
```

Never run `versions create` over documentation that already contains the next version's edits. Those edits would be frozen into the outgoing version. If work started early, restore the known clean outgoing state, build and advance it, then reapply the edits to the new current version.
:::

`create` publishes the current draft manifest, writes only changed source pages and tombstones to `version-deltas/8.1/`, freezes route/sidebar/change metadata, moves `8.1` into history, and makes `8.2` current. It refuses stale drafts, duplicate IDs, symbolic links, a dirty Git worktree, and dependencies outside the frozen boundary. Use `--allow-dirty` only when the uncommitted state is intentionally the release source.

Published versions also receive a generated `sourceHash`. Each delta binds the frozen route, sidebar, and change catalog with a metadata hash. `versions validate` reconstructs every committed delta and checks both hashes, so source or metadata drift is detected even when the artifact cache is empty. Do not edit the hashes or delta files by hand.

The operation is atomic: a failed preflight does not leave a partial delta or update the manifest. `versions list` prints the version order, `versions publish 8.1` prints the immutable manifest hash for CI publication, and `versions gc --dry-run` reports unreferenced local blobs before cleanup.

## Manifest

```json
{
  "$schema": "./node_modules/@sveltepress/cli/schema/versions.schema.json",
  "basePath": "/v",
  "current": { "id": "8.2", "label": "8.2" },
  "versions": [
    {
      "id": "8.1",
      "label": "8.1",
      "status": "deprecated",
      "message": "Upgrade to 8.2 for fixes.",
      "sourceRef": "v8.1.0",
      "search": { "facetFilters": ["version:8.1"] }
    }
  ],
  "content": {
    "include": ["**"],
    "exclude": ["internal/**"],
    "shared": ["$lib/**", "static/**"]
  },
  "artifacts": {
    "mode": "incremental",
    "siteId": "docs-example",
    "store": ".sveltepress/version-artifacts",
    "sources": "version-deltas"
  }
}
```

Version IDs are URL-safe lowercase identifiers and may contain dots or hyphens. `include` and `exclude` select route files to freeze. `shared` explicitly allows dependencies that remain live instead of being copied; keep this list narrow because a later change can affect every historical version.

Set `status` to `deprecated` or `eol` to show a prominent site-wide banner above the navigation. It warns that older-site functionality may be unavailable and links to the current version of the same logical page. `sourceRef` redirects historical edit links to a matching Git ref; set `editLink: false` to hide them. EOL versions default to `noindex`, and `noIndex: true` can opt another version out of indexing.

## Navigation and missing pages

The Default Theme adds an accessible version selector automatically. Internal links and the frozen sidebar stay in the selected historical version when the target route existed there. Switching versions preserves the logical page when possible; otherwise it opens that version's home page and displays an explanatory notice.

Custom themes can import `virtual:sveltepress/versions`. It exposes the validated manifest plus `resolveVersionContext`, `resolveVersionedPath`, and `resolveVersionSwitch` helpers.

Browser code that imports these helpers directly from the package should use `@sveltepress/vite/versioning/runtime`; this entry contains no Node file-system code. Build and configuration code can continue to use `@sveltepress/vite/versioning`.

## Search, PWA, and generated files

Historical search is disabled unless that version has an explicit `search` object. The Default Theme passes the selected version and search metadata to custom search components, and applies configured DocSearch facet filters. This prevents current results from being presented as historical documentation.

Version-aware builds also:

* emit canonical links for every page and `noindex` for configured versions;
* include current and historical URLs in `sitemap.xml`;
* keep root `llms.txt`/`llms-full.txt` current-only and write historical files below `/v/{id}/`;
* exclude historical HTML from PWA precaching and fetch it with a network-first strategy.

Treat `version-deltas` as immutable release source: review and commit it, but do not edit it by hand. The artifact store can be restored from those deltas on a cold CI worker, while a persistent CI cache avoids recompiling historical pages. Make corrections in current routes and create the next release delta.

## Describe what changed

SveltePress compares the current route inventory with the most recent historical version in manifest order. A route that only exists in the current version is listed as a new page. Use page frontmatter to provide a focused summary or keep a page out of the change catalog:

```yaml
---
title: What's new
versionChanges:
  exclude: true
  summary: Optional overview summary
---
```

For an existing Markdown page, mark only the important new section. The version, title, and page-unique stable ID are required:

```md
:::since[Hot reload configuration]{version="8.2" id="hot-reload" summary="No restart required"}
New documentation content.
:::
```

Unknown versions, duplicate IDs, unknown fields, and invalid field types stop development and production builds. New pages appear only under **New pages**; their `since` sections are not repeated under **Updated pages**. The first managed version has no comparison baseline and does not report the entire site as new.

The Default Theme displays page and section badges only while browsing the version that introduced them. Add a changelog route wherever it fits your site:

The sidebar adds a compact **New** badge to both new and updated pages. **On this page** adds the same badge only to sections declared with `:::since`. Override the compact text with `i18n.versionNavigationNewLabel`.

```svelte title="src/routes/whats-new/+page.svelte"
<script>
  import VersionChanges from '@sveltepress/theme-default/VersionChanges.svelte'
</script>

<VersionChanges />
```

See the official site's live catalog on the [What's new page](/whats-new/).

`VersionChanges` defaults to the current version and uses `?version={id}` for historical selections. Current links stay unprefixed; historical links target `/v/{id}/...`, including exact section anchors.

Custom themes can read the same immutable data from `virtual:sveltepress/versions`:

```ts
import {
  changeSets,
  resolveVersionChanges,
} from 'virtual:sveltepress/versions'

const currentChanges = resolveVersionChanges()
const historicalChanges = resolveVersionChanges('8.1')
```

`versions create` freezes the outgoing current change set in its immutable artifact manifest and source delta. Historical catalogs are always read from frozen metadata rather than reconstructed from later current documentation, and `versions validate` detects malformed markers, invalid references, duplicate anchors, corrupt artifacts, and delta drift.
