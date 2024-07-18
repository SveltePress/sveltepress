---
title: Frontmatter in default theme
---

## Shared frontmatter

```ts
interface CommonFrontmatter {
  title?: string
  description?: string
  lastUpdate?: string
}
```

### `title`
The final page title would be `page frontmatter title | siteConfig.title`  

### `description`
The final page description would be use the page frontmatter if provided instead of `siteConfig.description`
  
###  `lastUpdate` 

It will affect the "last update at: " content at the end of the page.  
Default it would read the git commit time of the +page file.    
You can override it by config this field.  

### `sidebar`

Determine to show the sidebar or not. Default is `true`, change to `false` to hide the sidebar

### `header`

Determine to show the header or not. Default is `true`, change to `false` to hide the header

## Special frontmatter

* [Home page frontmatter](/guide/default-theme/home-page/#Frontmatter)