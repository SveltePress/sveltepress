# @sveltepress/twoslash

Twoslash support for Sveltepress code blocks. It adds TypeScript hover information and diagnostics to Shiki-highlighted TypeScript, TSX, and Svelte examples.

## Installation

```bash
pnpm add -D @sveltepress/twoslash
```

## Usage with the default theme

Enable Twoslash in `vite.config.ts`:

```ts
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        highlighter: {
          twoslash: true,
        },
      }),
    }),
  ],
})
```

The package also exports `createTwoslasher` and `rendererFloatingSvelte` for custom integrations, plus `Floating.svelte` and `FloatingWrapper.svelte` component entry points.

See the [Twoslash guide](https://sveltepress.site/guide/default-theme/twoslash/) for annotations, errors, queries, cut markers, and Svelte examples.

## License

MIT
