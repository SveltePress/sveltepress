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

## Search, PWA, and generated files

Historical search is disabled unless that version has an explicit `search` object. The Default Theme passes the selected version and search metadata to custom search components, and applies configured DocSearch facet filters. This prevents current results from being presented as historical documentation.

Version-aware builds also:

* emit canonical links for every page and `noindex` for configured versions;
* include current and historical URLs in `sitemap.xml`;
* keep root `llms.txt`/`llms-full.txt` current-only and write historical files below `/v/{id}/`;
* exclude historical HTML from PWA precaching and fetch it with a network-first strategy.

Treat snapshot directories as generated release artifacts: review and commit them, but do not edit them by hand. Make corrections in the current routes and create the next snapshot.
