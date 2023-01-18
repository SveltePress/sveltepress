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

Export a const variable name as `frontmatter` would do

```svelte
<!-- src/routes/foo/+page.svelte -->
<script>
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
