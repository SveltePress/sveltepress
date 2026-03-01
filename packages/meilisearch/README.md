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
