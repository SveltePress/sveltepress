---
title: Frontmatter
---

## Frontmatter in markdown

Use yaml format at the beginning of your md file.

```md
---
title: Some title
description: some description
---
```

## Frontmatter in svelte

Export a const variable name as `frontmatter` in [Svelte context module](https://svelte.dev/docs#component-format-script-context-module) would do

```svelte title="/src/routes/foo/+page.svelte"
<script context="module">
  export const frontmatter = {
    title: 'Some title',
    description: 'Some description'
  }
</script>
```

## Accessing frontmatter in markdown

Use `fm` variable:

```md live
Frontmatter of this page is: 
<pre>
{JSON.stringify(fm, null, 2)}
</pre>
```

## Site frontmatter

The global shared frontmatter for every +page.md file

```ts
interface SiteConfig {
  title?: string
  description?: string
}
```
