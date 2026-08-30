---
title: Quick Start
---

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- Svelte 5, SvelteKit 2, and Vite 8
- pnpm 10 is recommended; npm, Yarn, and Bun are also supported by the create command

## Creating a project

Run the command for your package manager.

:::tip[PNPM first]
The repository and generated templates are tested with pnpm 10.
:::

@install-pkg(@sveltepress@latest,create)

## Adding to an existing sveltekit project

### Install vite plugin package

@install-pkg(@sveltepress/vite)

### Replace `sveltekit` plugin in vite.config.(js|ts)

```ts title="vite.config.(js|ts)"
import { sveltekit } from '@sveltejs/kit/vite' // [svp! --]
import { sveltepress } from '@sveltepress/vite' // [svp! ++]
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltekit(), // [svp! --]
    sveltepress(), // [svp! ++]
  ],
})

export default config
```

:::warning[Remove the original `sveltekit()` plugin]
`sveltepress()` already sets up SvelteKit for you. Keeping both `sveltekit()` and `sveltepress()` in `plugins` compiles every Svelte file twice and crashes the dev server with `Expected token }`.
:::

### Add `'.md'` extension to the `extensions` options in your svelte.config.js

```ts title="svelte.config.js"
// @noErrors
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  extensions: ['.svelte'], // [svp! --]
  extensions: ['.svelte', '.md'], // add .md here // [svp! ++]
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
    }),
  },
}

export default config
```

:::tip[No `svelte.config.js`? (newer SvelteKit layout)]
Projects scaffolded with a recent `npx sv create` keep their SvelteKit config inline in `vite.config.ts` and ship no `svelte.config.js`. Move those options into `sveltepress({ svelteKitOptions })` (Sveltepress adds the `'.md'` extension for you automatically) and remove the standalone `sveltekit()` plugin:

```ts title="vite.config.ts"
// @noErrors
import adapter from '@sveltejs/adapter-auto'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      svelteKitOptions: {
        compilerOptions: {
          runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
        },
        adapter: adapter(),
      },
    }),
  ],
})
```
:::
