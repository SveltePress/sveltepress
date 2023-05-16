---
title: Frontmatter
---

## Markdown 中的 frontmatter

在 md 文件的开头用 yaml 格式来配置 frontmatter

```md
---
title: 页面标题
description: 页面描述
---
```

## Svelte 中的 frontmatter

在 `+page.svelte` 的[Svelte context module](https://svelte.dev/docs#component-format-script-context-module)中导出一个名为 `frontmatter` 的变量即可

```svelte title="/src/routes/foo/+page.svelte"
<script context="module">
  export const frontmatter = {
    title: '页面标题',
    description: '页面描述'
  }
</script>
```

## 站点 frontmatter

```ts
interface SiteConfig {
  title?: string
  description?: string
}
```
