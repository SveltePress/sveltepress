---
title: Home Page
---

## Frontmatter

The `src/routes/+page.(md|svelte)` would be identified as home page

Home frontmatter can be like this.  
Take the frontmatter this site use for example:

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
* `external`  
  Determine whether to render a external icon on the right of action button

### `features`

The feature cards

* `title`  
  The title
* `description`  
  The text description under the title

## Slots

### `hero-image`

Use custom hero image content. Example: 

```html title="/src/routes/+page.(md|svelte)"
<div slot="hero-image">
Custom hero image content
</div>
```
