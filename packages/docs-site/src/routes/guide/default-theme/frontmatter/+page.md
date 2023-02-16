---
title: Frontmatter in default theme
---

## Shared frontmatter

```ts
interface CommonFrontmatter {
  title?: string
  description?: string
}
```

The final page title would be `page frontmatter title | siteConfig.title`  
The final page description would be use the page frontmatter if provided instead of `siteConfig.description`

## Special frontmatter

See:

[Home page frontmatter](/guide/default-theme/home-page/#Frontmatter)