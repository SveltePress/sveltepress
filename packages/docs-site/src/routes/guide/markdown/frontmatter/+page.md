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

## Site frontmatter

```ts
interface SiteConfig {
  title?: string
  description?: string
}
```
