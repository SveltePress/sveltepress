---
title: Frontmatter in default theme
---

## Common frontmatter

```ts
interface CommonFrontmatter {
  title?: string
  description?: string
}
```

The final page title would be `page frontmatter title | siteConfig.title`  
The final page description would be use the page frontmatter if provided instead of `siteConfig.description`


## Home page frontmatter

The `src/routes/+page.(md|svelte)` would be identified as home page

Home frontmatter can be like this.  
Use the frontmatter this site use for example:

@code(../../../+page.md,1,25)

And you can see [Home page](/) for result

### `heroImage`

The home page logo image. It is recommended to use a high quality

### `tagline`

The small description text under site title and description

### `actions`

The action buttons
* `label`
  The label text of action button
* `to`
  The link address of action button
