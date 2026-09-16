<script module>
  export const frontmatter = {
    title: '自定义',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BLOG_CUSTOMIZATION_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="zh" slug={BLOG_CUSTOMIZATION_SLUG} />
