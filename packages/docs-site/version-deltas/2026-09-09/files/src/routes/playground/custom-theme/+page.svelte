<script module>
  export const frontmatter = {
    title: 'Custom theme',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { CUSTOM_THEME_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" slug={CUSTOM_THEME_SLUG} />
