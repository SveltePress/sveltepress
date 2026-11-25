---
title: Sveltepress CLI
versionChanges:
  exclude: true
---

The `@sveltepress/cli` package provides the `sveltepress` command line tool for managing document versions, manifests, immutable source deltas, and incremental build artifacts.

## Installation

```sh
pnpm add -D @sveltepress/cli
```

## Synopsis

```sh
sveltepress versions <command> [options]
```

## Subcommands

### `init`

Initialize a new version manifest file (`sveltepress.versions.json`):

```sh
sveltepress versions init --current 1.0 --label "1.0"
```

* `--current <id>`: Identifier of the current version. Required.
* `--label <label>`: Display label for the current version (defaults to the ID).
* `--base-path <path>`: Root prefix for historical routes (default: `'/v'`, or `'/<locale>/v'` with `--locale`).
* `--locale <id>`: Target locale (e.g. `zh`, `bn`). Creates `sveltepress.versions.<locale>.json`.

### `create`

Freeze the version that is current now and start a new current version:

```sh
sveltepress versions create 1.1 --label "1.1"
```

With `1.0` current, this freezes `1.0` as an immutable historical version under the ID and label it already has, and makes `1.1` the current version.

* `<version-id>`: Identifier of the **new current** version. It must not exist yet.
* `--label <label>`: Display label of the new current version (defaults to `<version-id>`).
* `--locale <id>`: Freeze only the specified locale manifest.
* `--allow-dirty`: Allow creating a release with uncommitted git changes.

### `list`

Print all registered documentation versions and their statuses:

```sh
sveltepress versions list
sveltepress versions list --locale zh
```

* `--locale <id>`: Target locale.

### `validate`

Verify manifest structure, release change catalogs, artifact integrity, and delta consistency:

```sh
sveltepress versions validate
sveltepress versions validate --locale bn
```

* `--locale <id>`: Target locale.

:::since[Current-only Vite compose]{version="2026-09-17" id="versions-cli-overlay-plan" summary="versions plan reports overlay counts; versions build prerenders current trees then overlays frozen /v/ HTML."}
`versions plan` JSON includes `vitePrerenderScope: "current-only"` and `overlaidHistoricalHtml`. Without `--locale`, `versions build` prerenders current locale trees only, then overlays frozen `/v/` HTML into the same output.
:::

### `plan`

Preview the incremental build plan, showing page reuse, changed routes, overlay counts, and invalidations. The JSON includes `vitePrerenderScope: "current-only"` and `overlaidHistoricalHtml`.

```sh
sveltepress versions plan
```

* `--locale <id>`: Target locale.

### `build`

Execute version-aware production compilation. Without `--locale`, it drafts every locale, runs Vite on current trees only, then overlays frozen `/v/` HTML into the same output:

```sh
sveltepress versions build
sveltepress versions build --locale zh
```

* `--locale <id>`: Build only the specified locale.
* `--draft-only`: Compile draft artifacts without composing final outputs.

### `compose`

Compose precompiled page artifacts into the final site distribution directory:

```sh
sveltepress versions compose
```

* `--locale <id>`: Target locale.

### `publish`

Print the identity of a version that is already frozen, for example to record it in a CI job. It reads the artifact store and changes nothing:

```sh
sveltepress versions publish 1.0
```

The output is JSON with `siteId`, `versionId`, `manifestHash`, and the number of `pages`.

* `<version-id>`: A frozen version from the manifest.
* `--locale <id>`: Target locale.

:::note[Lifecycle status]
No subcommand changes the `status` or `message` of a frozen version yet. See [Version management](/guide/version-management/) for what the manifest accepts today.
:::

### `migrate`

Migrate older version metadata to the content-addressed incremental artifact store:

```sh
sveltepress versions migrate --site-id my-docs
```

* `--site-id <id>`: Unique identifier for the artifact store.
* `--store <dir>`: Custom artifact store directory.
* `--locale <id>`: Target locale.

### `gc`

Clean up orphaned or unreferenced page artifacts from the local artifact store:

```sh
sveltepress versions gc --dry-run
sveltepress versions gc
```

* `--dry-run`: Report how many artifacts would be removed without deleting anything.
* `--locale <id>`: Target locale.
