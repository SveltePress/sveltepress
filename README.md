# Sveltepress 

Inspired by [Vitepress](https://vitepress.vuejs.org/). 
But build with [SvelteKit](https://kit.svelte.dev/), [mdsvex](https://mdsvex.com/), [UNOCSS](https://github.com/unocss/unocss)

## Quick start

You can manually follow these steps to construct your own project

- Create a sveltekit project by using `npm create svelte@latest my-app`. Or you can follow the [Creating a project - SvelteKit](https://kit.svelte.dev/docs/creating-a-project)
- Install these packages
  - @svelte-press/svelte-preprocessor
  - @svelte-press/vite
  - unocss
- Add unocss vite plugin and sveltepress plugin in your vite.config.(js|ts). Your config may look like this
```js
// vite.config.(js|ts)
import { sveltekit } from '@sveltejs/kit/vite'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno, presetAttributify } from 'unocss'
import { defineConfig } from 'vite'
import VitePlugSveltepress, { safelist } from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    VitePlugSveltepress(),
    Unocss({
      presets: [
        presetAttributify(),
        presetUno(),
        presetIcons(),
      ],
      safelist
    }),
    sveltekit(),
  ],
})

export default config
```
- Add sveltepress preprocessor in your svelte.config.js. Your config may look like this
```js
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/kit/vite'
import sveltepressPreprocessor from '@svelte-press/svelte-preprocessor'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess(), sveltepressPreprocessor({})],
  kit: {
    adapter: adapter(),
  },
}
export default config
```
- Import `'virtual:sveltepress'` module in your routes/+layout.(md|svelte). Your layout file may look like this:
```html
<script>
  import 'virtual:sveltepress'
</script>
<!-- Some layout content -->
```
- Now you can start to write markdowns.

## Online docs and demos

> TODO: Add online docs and demos

## Themes

### Default Theme

All the pages in `src/routes/(default)` are using the default theme

### Blog Theme

All the pages in `src/routes/posts` are using the default theme

## Markdown Features

### Code Highlight

````md
```js
function name(params) {

  return 'foo'
}
```
````

### Svelte in Markdown

* `.svelte` and `.md` can be used as pages. For example, you can use `+page.(svelte|md)` as pages and `+layout.(md|svelte)` as layouts
* `.md` files can use the features provided by [mdsvex](https://mdsvex.com/)


### Live Code

Code Blocks with svelte lang and live attribute would render in page and show the source code below the render dom

````md
```svelte live
<script>
  let count = 10
  const add = () => {
    count++
  }
</script>

<button type="button" on:click={add}>
  Count is {count}
</button>

<style>
  button {
    color: orange;
  }
</style>
```
````

### Admonition Block

```md
:::[tip|info|caution|warning|important|note] Title
Some admonition content
:::
```

## LICENSE

MIT