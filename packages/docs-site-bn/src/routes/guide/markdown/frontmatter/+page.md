---
title: Frontmatter
---

## Markdown এ Frontmatter

আপনার md ফাইলের শুরুতে yaml ফরম্যাট ব্যবহার করুন।

```md
---
title: Some title
description: some description
---
```

## Svelte এ Frontmatter

[Svelte context module](https://svelte.dev/docs#component-format-script-context-module) এ`frontmatter` নামক একটি const variable এক্সপোর্ট করুন

```svelte title="/src/routes/foo/+page.svelte"
<script module>
  export const frontmatter = {
    title: 'Some title',
    description: 'Some description',
  }
</script>
```

## Markdown এ Frontmatter অ্যাক্সেস করা

`fm` variable ব্যবহার করুন:

```md live
Frontmatter of this page is:
<pre>
{JSON.stringify(fm, null, 2)}
</pre>
```

## সাইট Frontmatter

প্রত্যেকটি +page.md ফাইল থেকে অ্যাক্সেস করা যাবে এমন ব্যাপক frontmatter

```ts
interface SiteConfig {
  title?: string
  description?: string
}
```
