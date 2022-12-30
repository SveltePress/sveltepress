# Sveltepress 

A content centered site build tools

Inspired by [Vitepress](https://vitepress.vuejs.org/). 
But build with [SvelteKit](https://kit.svelte.dev/), [Mdsvex](https://mdsvex.com/), [UNOCSS](https://github.com/unocss/unocss)

## Quick start

### Creating a project

- `npm init @svelte-press`
> TODO: Complete the @svelte-press/create package
### Add to a existing sveltekit project

- `npm i --save @svelte-press/vite`
- Add plugin in your vite config
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

Notice that you will no longer need sveltekit plugin any more.  
Sveltepress plugin would handle that for you.

## Markdown features

### Code highlight

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

### Svelte live code

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

### Admonition

```md
:::[tip|info|caution|warning|important|note] Title
Some admonition content
:::
```

## Themes

### Default theme

> TODO: Add default theme

### Blog theme

> TODO: Add blog theme

## Online docs and demos

> TODO: Add online docs and demos

## LICENSE

MIT
