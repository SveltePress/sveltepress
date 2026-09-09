---
title: 'virtual:sveltepress/site'
versionChanges:
  exclude: true
---

The `virtual:sveltepress/site` module exposes the core site metadata (`title`, `description`) passed to `sveltepress({ siteConfig })`.

Custom themes, components, and layout templates can import this module to display the global site name and description or populate meta tags.

## Live data

Here is an interactive inspection of `siteConfig` on this site:

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import siteConfig from 'virtual:sveltepress/site'
</script>

<div class="viewer">
  <JsonViewer data={siteConfig} />
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

### `default`

* **Type**: `{ title: string, description: string }`

The default export is the site configuration object:

* `title`: The site title configured in `siteConfig.title`. Defaults to `'Untitled site'` if not specified.
* `description`: The site description configured in `siteConfig.description`. Defaults to `'Build by sveltepress'` if not specified.

## Working with TypeScript

Include `@sveltepress/vite/types` in your `src/app.d.ts` to get full type tips for `virtual:sveltepress/site`:

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// Your other types
```
