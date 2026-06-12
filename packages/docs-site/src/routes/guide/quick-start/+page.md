---
title: Quick Start
---

## Creating a project

Run one of the following command
Depend on what package manager you are using

:::tip[PNPM first]
Use pnpm as much as possible. It respects package version more than npm.
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
