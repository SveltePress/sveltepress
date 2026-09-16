<script module>
  export const frontmatter = {
    title: '国际化',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { I18N_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="zh" slug={I18N_SLUG} />
