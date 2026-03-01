# @sveltepress/docsearch

Algolia DocSearch component for SveltePress.

## Installation

```bash
pnpm add @sveltepress/docsearch
```

## Usage

Import and use the Search component:

```svelte
<script>
  import Search from '@sveltepress/docsearch/Search.svelte'
</script>

<Search
  appId="YOUR_APP_ID"
  apiKey="YOUR_API_KEY"
  indexName="YOUR_INDEX_NAME"
/>
```

The component automatically handles dark mode switching by observing the `dark` class on `<html>`.

## Type Exports

```typescript
import type { DocSearchProps } from '@sveltepress/docsearch/types'
```

## License

MIT
