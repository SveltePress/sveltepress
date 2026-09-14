<script module>
  export const frontmatter = {
    title: '虚拟模块',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { VIRTUAL_MODULES_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="zh" slug={VIRTUAL_MODULES_SLUG} />
