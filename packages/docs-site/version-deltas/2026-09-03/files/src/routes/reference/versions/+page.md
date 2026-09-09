---
title: 'virtual:sveltepress/versions'
versionChanges:
  exclude: true
---

When document version management is enabled in `@sveltepress/vite`, `virtual:sveltepress/versions` exposes version manifests, route helpers, release change sets, and the version runtime.

Custom themes and components can import this module to build version selectors, lifecycle banners, changelog catalogs, and version-aware navigation links.

## Live data

Here is an interactive inspection of the version runtime data on this site:

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import versions from 'virtual:sveltepress/versions'
</script>

<div class="viewer">
  <JsonViewer data={versions} />
</div>
<style>
  .viewer {
    max-height: 40vh;
    overflow: auto;
  }
  :global(html.dark) .viewer {
    --discovery-background-color: #1a1a1a;
    --sjd-app-bg: #1a1a1a;
    --sjd-fmt-color: #999;
    --sjd-fmt-hover-color: #aaa;
    --sjd-fmt-property-color: #d17a8c;
    --sjd-fmt-number-color: #0f8dc2;
    --sjd-fmt-atom-color: #0f8dc2;
    --sjd-fmt-string-color: #7faf20;
    --sjd-fmt-string-underline-color: #85ab51;
    --sjd-fmt-string-hover-color: #97cf26;
    --sjd-ui-color: #ccc;
    --sjd-match-bg: #565638;
    --sjd-match-border: #a7a73b;
    --sjd-error-border: #0004;
    --sjd-error-bg: #622b29;
    --sjd-error-color: #c66;
    --sjd-error-message-bg: #443232;
    --sjd-toggle-color: #72b372;
    --sjd-touch-button-color: #aaa;
    --sjd-touch-button-bg: #50505080;
    --sjd-popup-bg: #333;
    --sjd-popup-color: #ccc;
    --sjd-popup-notes-color: #999;
    --sjd-popup-error-color: #e66;
    color-scheme: dark;
  }
</style>
```

## Module exports

### `manifest`

* **Type**: `VersionManifest | null`

The version manifest for the default locale (`'/'`). When document versioning is not enabled or no manifest exists, this is `null`.

### `manifests`

* **Type**: `Record<string, VersionManifest | null>`

A dictionary of version manifests keyed by locale prefix (e.g. `'/'`, `'/zh/'`, `'/bn/'`). On a single-locale site, it contains `{ '/': manifest }`.

### `changeSets`

* **Type**: `Record<string, VersionChangeSet>`

A dictionary of release change sets keyed by version ID. Each entry describes `newPages` and `updatedPages` relative to its baseline historical version.

### `resolveVersionManifest`

* **Type**: `(pathname: string) => VersionManifest | null`

Resolves the matching `VersionManifest` for the given route pathname based on its locale prefix.

### `resolveVersionChanges`

* **Type**: `(versionId?: string, pathname?: string) => VersionChangeSet | null`

Returns the change set for the specified `versionId`. When omitted, it resolves changes for the current version. The optional `pathname` selects the locale's own manifest on multi-locale sites.

### `resolveVersionContext`

* **Type**: `(pathname: string) => VersionContext | null`

Resolves the `VersionContext` for a URL pathname, containing:
* `versionId`: The active version ID (e.g. current or a historical version ID).
* `version`: The matching `DocumentationVersion` configuration object.
* `logicalPath`: The normalized route path stripped of version and locale prefixes.
* `historical`: `boolean` indicating whether the route is a historical version snapshot.
* `basePath`: The version base path (such as `'/v'` or `'/zh/v'`).
* `manifest`: The resolved `VersionManifest` instance.

### `resolveVersionedPath`

* **Type**: `(to: string, context: VersionContext | null) => string`

Resolves an internal link target within a historical version context. If the target route existed in that historical version snapshot, it returns the versioned link; otherwise it returns the original unversioned path.

### `resolveVersionSwitch`

* **Type**: `(pathname: string, targetVersionId: string) => VersionSwitchTarget | null`

Calculates navigation destinations when switching versions from `pathname` to `targetVersionId`. Returns `{ href, fallback }`, where `fallback` is `true` if the route did not exist in the target version and fell back to the version home page.

### `default`

* **Type**: `VersionRuntime`

The default export is the runtime object itself, bundling all helper functions alongside `manifest`, `manifests`, and `changeSets`.

## Working with TypeScript

Include `@sveltepress/vite/types` in your `src/app.d.ts` to get full type tips for `virtual:sveltepress/versions`:

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// Your other types
```
