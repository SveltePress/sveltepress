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

## Create a release snapshot

Create the next current version. The CLI resolves the site's Vite and Default Theme configuration itself, so it can freeze the active sidebar without a preliminary build:

```sh
pnpm exec sveltepress versions create 8.2 --label "8.2"
pnpm exec sveltepress versions validate
```

`create` copies the selected route source into `src/routes/v/8.1/`, records route and sidebar metadata, moves `8.1` into the historical list, and makes `8.2` current. It refuses duplicate IDs, symbolic links, a dirty Git worktree, and dependencies outside the frozen boundary. Use `--allow-dirty` only when the uncommitted state is intentionally the release source.

The operation is atomic: a failed preflight does not leave a partial snapshot or update the manifest. `versions list` prints the current and historical versions, while `versions validate` detects missing and orphaned snapshot directories.

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
  }
}
```

Version IDs are URL-safe lowercase identifiers and may contain dots or hyphens. `include` and `exclude` select route files to freeze. `shared` explicitly allows dependencies that remain live instead of being copied; keep this list narrow because a later change can affect every historical version.

Set `status` to `deprecated` or `eol` to show a lifecycle banner. `sourceRef` redirects historical edit links to a matching Git ref; set `editLink: false` to hide them. EOL versions default to `noindex`, and `noIndex: true` can opt another version out of indexing.

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

Treat snapshot directories as generated release artifacts: review and commit them, but do not edit them by hand. Make corrections in the current routes and create the next snapshot.

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

`versions create` freezes the outgoing current change set in `.sveltepress-version.json`. Historical catalogs are always read from that metadata rather than reconstructed from later current documentation, and `versions validate` detects malformed markers, invalid references, duplicate anchors, and snapshot drift.
