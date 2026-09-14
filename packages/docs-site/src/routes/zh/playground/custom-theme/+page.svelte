<script module>
  export const frontmatter = {
    title: '自定义主题',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { CUSTOM_THEME_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="zh" slug={CUSTOM_THEME_SLUG} />
