# Sveltepress 

A content centered site build tools

Inspired by [Vitepress](https://vitepress.vuejs.org/).   
But build with [SvelteKit](https://kit.svelte.dev/), [Mdsvex](https://mdsvex.com/), [Unocss](https://github.com/unocss/unocss)

## Quick start

### Creating a project

- Run one of the following command. Depends on what package manager you are using
  - `npm create @svelte-press`
  - `yarn create @svelte-press`
  - `pnpm create @svelte-press`
- Answer the questions to pick your flavor

### Add to an existing sveltekit project

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
    // Here are your other plugins except for sveltekit()
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
:::[tip|info|note|warning|important|caution] Title
Some admonition content
:::
```

![image](https://user-images.githubusercontent.com/41723543/210292672-d4f779fa-0fd5-453a-a818-e26555a1e729.png)

### Frontmatter

* title - The title of the page
* description - The description of the page

## Themes

### Default theme

> TODO: Add default theme

### Blog theme

> TODO: Add blog theme

## Online docs and demos

> TODO: Add online docs and demos


## Plugin options

* siteConfig
  * title  
  The title of the site. If you set a +page.md title frontmatter, the final title would be `[Page Title] - [siteConfig.title]`.  
  Default is `'Untitled site'`
  * description  
  The description of the site. If you set a +page.md description frontmatter. It would override this.  
  Default is `'Build by Sveltepress'`
* addInspect - Determine whether 
## LICENSE

MIT
