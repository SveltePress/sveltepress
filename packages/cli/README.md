# @sveltepress/cli

Command-line tools for Sveltepress document version management. The CLI creates and validates the version manifest, freezes historical route snapshots, and lists the versions available to a site.

## Installation

```bash
pnpm add -D @sveltepress/cli
```

## Usage

Initialize version management with the version currently served by the site:

```bash
pnpm exec sveltepress versions init --current 8.1 --label "8.1"
```

Create the next current version, then validate the manifest and snapshots:

```bash
pnpm exec sveltepress versions create 8.2 --label "8.2"
pnpm exec sveltepress versions validate
```

`versions create` freezes the outgoing current documentation below the configured version prefix and promotes the new version. It refuses unsafe inputs such as duplicate IDs, symbolic links, and a dirty Git worktree unless `--allow-dirty` is explicitly provided.

List the current and historical versions with:

```bash
pnpm exec sveltepress versions list
```

See the [document version management guide](https://sveltepress.site/guide/version-management/) for manifest options, snapshot boundaries, and theme integration.

## License

MIT
