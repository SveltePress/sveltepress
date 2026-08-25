# @sveltepress/meilisearch

Meilisearch search component for SveltePress.

## Installation

```bash
pnpm add @sveltepress/meilisearch
```

## Usage

In your `vite.config.ts`:

```typescript
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  search: '/path/to/your/MeilisearchWrapper.svelte',
})
```

> **Known production build bug:** the custom-search API and Meilisearch component are supported, and this source-path configuration works in development. The current default-theme runtime leaves the `.svelte` path as a browser import, so a static production build does not bundle it yet. Track this as a default-theme bundling bug rather than an unsupported Meilisearch feature, and verify your deployment while that runtime path is being fixed.

Create a wrapper component:

```svelte
<script>
  import Search from '@sveltepress/meilisearch/Search.svelte'
</script>

<Search
  host="https://your-meilisearch-instance.com"
  apiKey="YOUR_SEARCH_API_KEY"
  indexName="docs"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `host` | `string` | ✅ | - | Meilisearch host URL |
| `apiKey` | `string` | ✅ | - | Search-only API key |
| `indexName` | `string` | ✅ | - | Index name to search |
| `placeholder` | `string` | ❌ | `'Search...'` | Input placeholder |
| `limit` | `number` | ❌ | `10` | Max results |

## Features

- ⌘K / Ctrl+K keyboard shortcut
- Debounced search (200ms)
- Highlighted results
- Dark mode support
- Responsive modal UI

## Type Exports

```typescript
import type { MeilisearchProps, SearchResult } from '@sveltepress/meilisearch/types'
```

## License

MIT
