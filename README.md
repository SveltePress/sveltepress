# Sveltepress 

A content centered site build tools

Inspired by [Vitepress](https://vitepress.vuejs.org/). 
But build with [SvelteKit](https://kit.svelte.dev/), [Mdsvex](https://mdsvex.com/), [UNOCSS](https://github.com/unocss/unocss)

## Quick start

### Creating a Project

- `npm init @svelte-press`
> TODO: Complete the @svelte-press/create package
### Add To a Existing SvelteKit Project

- `npm i --save @svelte-press/vite`
- Add plugin in your vite config.   
Notice that you will no longer need sveltekit plugin any more.  
Sveltepress plugin would handle that for you.
```js
// vite.config.(js|ts)
import { defineConfig } from 'vite'
import Sveltepress from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    Sveltepress(),
    // You won't need sveltekit() here any more
    // Here are your other plugins expect for sveltekit()
  ],
})

export default config
```

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
* `.md` files can use the features provided by [Mdsvex](https://mdsvex.com/)

### Live Code

Code Blocks with svelte lang and `live` attribute would render in page and show the __expandable source code__ below the render dom

For example write something like this in your markdown

````md
```svelte live
<script>
  let count = 0
  const add = () => {
    count++
  }
</script>

<button 
  type="button" 
  on:click={add} 
  class="cursor-pointer px-1 py-2 text-orange-5"
>
  Count is {count}
</button>
```
````

Would render like this

![live code demo](./assets/live-code.gif)

### Admonition Block

```md
:::[tip|info|caution|warning|important|note] Title
Some admonition content
:::
```

## Themes

### Default Theme

> TODO: Add default theme

### Blog Theme

> TODO: Add blog theme

## Online docs and demos

> TODO: Add online docs and demos

## LICENSE

MIT
