---
title: Home Page
---

## Frontmatter

The `src/routes/+page.(md|svelte)` would be identified as home page

Home frontmatter can be like this.  
Take the frontmatter this site use for example:

@code(../../../+page.md)

And you can see [Home page](/) for result

### `heroImage`

The home page logo image. It is recommended to use an image with high quality

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
* `icon`  
custom icon config
  * `type` - `'svg' | 'iconify'`
  * `value` - the svg content for svg type icon
  * `collection` - the collection name of iconify
  * `name` - the icon name in the specified collection of iconify

:::note[Icon pre-build required]
The iconify icons should be in the [Pre-build iconify icons config](/reference/default-theme/#preBuildIconifyIcons)
:::

### `home`

Config to `false` to remove all home page content that mentioned above.

## Slots

### `hero-image`

Use custom hero image content. Example: 

```html title="/src/routes/+page.(md|svelte)"
<div slot="hero-image">
Custom hero image content
</div>
```
