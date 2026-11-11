---
title: Quick Start
---

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- Svelte 5, SvelteKit 2 (`2.65.1` or later) or SvelteKit 3, and Vite 8
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

### Install dependencies

```bash
npm i svelte2tsx
npm i -D @sveltepress/theme-default
```

### Add first `+page.md` file to `docs/` folder to your project

```md title="docs/+page.md"
--- // [svp! ++]
title: Welcome to Sveltepress // [svp! ++]
--- // [svp! ++]
## This is your first page // [svp! ++]
Hello, world! // [svp! ++]
```

### Add example file `+page.md` to `docs/first/` folder to your project

```md title="docs/first/+page.md"
## First // [svp! ++]
This is the first page. // [svp! ++]
```


### Replace `sveltekit` plugin in vite.config.(js|ts)

```ts title="vite.config.(js|ts)"
import { sveltekit } from '@sveltejs/kit/vite' // [svp! --]
import { sveltepress } from '@sveltepress/vite' // [svp! ++]
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltekit(), // [svp! --]
    sveltepress({ // [svp! ++]
      theme: defaultTheme({ // [svp! ++]
        navbar: [ // [svp! ++]
          { // [svp! ++]
            title: 'Hello Navbar', // [svp! ++]
            to: '/docs/first/' // [svp! ++]
          } // [svp! ++]
        ], // [svp! ++]
        sidebar: { // [svp! ++]
          '/docs/': [ // [svp! ++]
            { // [svp! ++]
              title: 'Docs Home', // [svp! ++]
              to: '/docs/' // [svp! ++]
            }, // [svp! ++]
            { // [svp! ++]
              title: 'First Sidebar Item', // [svp! ++]
              to: '/docs/first/' // [svp! ++]
            } // [svp! ++]
          ] // [svp! ++]
        }, // [svp! ++]
        github: 'https://github.com/Blackman99/sveltepress' // [svp! ++]
        // logo: '/sveltepress.svg' // [svp! ++]
      }),
    }), // [svp! ++]
  ],
})

export default config
```

:::warning[Remove the original `sveltekit()` plugin]
`sveltepress()` already sets up SvelteKit for you. Keeping both `sveltekit()` and `sveltepress()` in `plugins` compiles every Svelte file twice and crashes the dev server with `Expected token }`.
:::

### Pass your SvelteKit config through `sveltepress()`

:::since[SvelteKit 3 support]{version="2026-10-05" id="sveltekit-3" summary="Sveltepress supports SvelteKit 3. SvelteKit config goes through svelteKitOptions because svelte.config.js is no longer read."}
SvelteKit 3 no longer reads `svelte.config.js`, and refuses to start while one exists. Move its options, including everything that was under `kit`, into `sveltepress({ svelteKitOptions })`, then delete `svelte.config.js`. Sveltepress adds the `'.md'` extension for you.

```ts title="vite.config.ts"
// @noErrors
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      svelteKitOptions: {
        preprocess: [vitePreprocess()],
        adapter: adapter({
          pages: 'dist',
        }),
      },
    }),
  ],
})
```
:::

:::tip[Still on SvelteKit 2?]
SvelteKit 2 accepts `svelteKitOptions` too. Alternatively, keep `svelte.config.js` and add `'.md'` to its `extensions`:

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
:::

## Upgrading to SvelteKit 3

1. Upgrade `@sveltejs/kit` to `^3.0.0` and your adapter to its SvelteKit 3 release, for example `@sveltejs/adapter-static` `^4.0.0`. SvelteKit 3 needs Node.js `>=22.17`.
2. Run `npx sv migrate sveltekit-3` to migrate your own code, such as `$app/stores`, `base` from `$app/paths`, and `$lib` imports.
3. Make sure your SvelteKit config lives in `sveltepress({ svelteKitOptions })` as shown above. The migration moves `svelte.config.js` into a `sveltekit(...)` call in your Vite config: move that object into `svelteKitOptions` and remove the `sveltekit(...)` plugin.

Sveltepress itself needs no other change. Keep these in mind:

- `$lib` is replaced by the `#lib` subpath import. [Version management](/guide/version-management/) tracks `#lib/` imports like `$lib/` ones, so if your manifest shares `$lib/**`, add `#lib/**` to `content.shared` as well.
- The Default Theme [`pwa`](/guide/default-theme/pwa/) option relies on `@vite-pwa/sveltekit`, which does not support SvelteKit 3 yet. On SvelteKit 3 no service worker is generated, and the build prints a warning.
