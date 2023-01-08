---
title: Quick Start
---

## Create a project

Run one of the following command  
Depend on what package manager you are using

  ```sh
  # via npm
  npm create @svelte-press

  # via yarn
  yarn create @svelte-press
  
  # vai pnpm
  pnpm create @svelte-press
  ```

## Add to an existing sveltekit project

### Install vite plugin package
```sh
# via npm
npm install --save @svelte-press/vite

# via yarn
yarn add @svelte-press/vite

# vai pnpm
pnpm install @svelte-press/vite
```

### Replace `sveltekit` plugin in vite.config.(js|ts)

```js
// vite.config.(js|ts)
import { defineConfig } from 'vite'
import Sveltepress from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    Sveltepress(),
    // You won't need sveltekit() here any more
    // Here are your other plugins except for sveltekit()
  ],
})

export default config
```