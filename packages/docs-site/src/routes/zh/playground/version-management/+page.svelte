<script module>
  export const frontmatter = {
    title: '文档版本管理',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { VERSION_MANAGEMENT_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="zh" slug={VERSION_MANAGEMENT_SLUG} />
