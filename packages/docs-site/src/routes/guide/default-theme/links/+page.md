---
title: Default theme links
---

## Markdown links

Links starts with `http(s)` is recognized as external links  
It would render an external icon to the right of link text label

**Input**

```md
[External Link](https://link.address)
[Internal Link](/guide/introduction/)
```

**Output**

[External Link](https://link.address)  
[Internal Link](/guide/introduction/)

## Link component in markdown

You can directly use Link component in md pages which is auto imported

**Input**

```md
* <Link to="https://github.com/" label="Github" />  
* <Link to="/" label="Home page" />
```

**Output**

* <Link to="https://github.com/" label="Github" />  
* <Link to="/" label="Home page" />

## Link components in svelte

Link component in svelte files should import manually.

```svelte live
<script>
  import Link from '@sveltepress/theme-default/Link.svelte' // [svp! ~~]
</script>
<div style="line-height: 24px;">
  <Link to="/" label="Home page" /> <br />
  <Link to="https://github.com/" label="Github" />
</div>
```