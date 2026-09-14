<script module>
  export const frontmatter = {
    title: '写作基础',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BASIC_WRITING_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="zh" slug={BASIC_WRITING_SLUG} />
