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
The final page description would be `page frontmatter description | siteConfig.description`


## Home page frontmatter

The `src/routes/+page.(md|svelte)` would be identified as home page

Home frontmatter can be like this.  
Use the frontmatter this site use for example:

```yaml
heroImage: /android-chrome-192x192.png
tagline: A simple, easy to use, content centered site build tool with the full power of Sveltekit.
actions:
  - label: Read the docs
    to: /guide/introduction/
    type: primary
  - label: View on github
    type: flat
    to: https://github.com/Blackman99/sveltepress
    external: true
features:
  - title: Markdown centered
    description: To help you can start writing with minimal configuration.
  - title: Build with Sveltekit
    description: Preserve the full power of Sveltekit. So that you can do more than SSG.
  - title: Svelte in Markdown
    description: Feel free to use svelte in markdown. Explore infinite possibilities.
  - title: Type friendly
    description: All APIs are fully typed with typescript.
  - title: Theme Customizable
    description: Feel free to use default theme, community themes or write your own.
```

And you can see [Home page](/) for result