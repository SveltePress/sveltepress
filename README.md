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
__This theme is under heavily development. The guide below is just an primitive API)__

* Install
```sh
# via npm
npm install --save-dev @svelte-press/theme-default

# via pnpm
pnpm install -D @svelte-press/theme-default

# via yarn
yarn add -D @svelte-press/theme-default
```
* Pass it to vite plugin sveltepress in your vite config. Here's an minimal example.
```ts
// vite.config.(ts|js)
import { defineConfig } from 'vite'
import { sveltepress } from '@svelte-press/vite'
import { defaultTheme } from '@svelte-press/theme-default'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(),
      siteConfig: {
        title: 'Sveltepress',
        description: 'A content centered site build tool',
      },
    }),
  ],
})

export default config

```

### Blog theme

> TODO: Add blog theme

## Online docs and demos

> TODO: Add online docs and demos


## Plugin options

* `siteConfig: SiteConfig`
  * `title: string`  
  Default: `'Untitled site'`  
  The title of the site.   
  If you set a +page.md title frontmatter, the final title would be `[Page Title] - [siteConfig.title]`.  
  * `description: string`  
  Default: `'Build by Sveltepress'`  
  The description of the site.   
  If you set a +page.md description frontmatter. 
  It would override `siteConfig.description`  
* `addInspect: boolean`  
  Default: `false`  
  Determine whether to add [vue-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) plugin.   
  It is useful when developing sveltepress or inspecting the vite pipeline.  
* `theme?: ThemeResolved`  
  Default: `undefined`  
  The theme that you want to use. 
  * `name: string` The name of the theme.
  * `globalLayout: string`   
    The absolute path of GlobalLayout.svelte that theme use.  
    It will used for wrapping all pages. Even the src/routes/+layout.svelte will become its child.   

## LICENSE

MIT
