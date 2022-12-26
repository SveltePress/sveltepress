# Sveltepress 

Inspired by [Vitepress](https://vitepress.vuejs.org/). 
But build with [SvelteKit](https://kit.svelte.dev/), [mdsvex](https://mdsvex.com/), [UNOCSS](https://github.com/unocss/unocss)

## Online demo

TODO

## Themes

### Default Theme

All the pages in `src/routes/(default)` are using the default theme

### Blog Theme

All the pages in `src/routes/posts` are using the default theme

## Markdown 

### Code Blocks

````md
```js
function name(params) {

  return 'foo'
}
```
````

### Svelte in Markdown

* `.svelte` and `.md` can be used as pages. For example, you can use `+page.(svelte|md)` as pages
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