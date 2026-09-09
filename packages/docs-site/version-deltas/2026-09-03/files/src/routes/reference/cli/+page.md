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

* `--current <id>`: Initial version identifier (default: `'current'`).
* `--label <label>`: Display label for the current version.
* `--base-path <path>`: Root prefix for historical routes (default: `'/v'`).
* `--locale <id>`: Target locale (e.g. `zh`, `bn`). Creates `sveltepress.versions.<locale>.json`.

### `create`

Freeze the current documentation into an immutable historical version snapshot:

```sh
sveltepress versions create 1.0 --label "v1.0"
```

* `<version-id>`: Unique identifier for the frozen release.
* `--label <label>`: Display label in the version selector (defaults to `<version-id>`).
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

### `plan`

Preview the incremental build plan, showing page reuse, changed routes, and invalidations:

```sh
sveltepress versions plan
```

* `--locale <id>`: Target locale.

### `build`

Execute version-aware production compilation. Without `--locale`, it builds and composes all locales:

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

Update lifecycle status (`stable`, `deprecated`, `eol`) and advisory messages in the manifest:

```sh
sveltepress versions publish --status deprecated --message "Please upgrade to v2"
```

* `--status <stable|deprecated|eol>`: New lifecycle status.
* `--message <text>`: Advisory warning text for the lifecycle banner.
* `--locale <id>`: Target locale.

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
sveltepress versions gc
```

* `--locale <id>`: Target locale.
