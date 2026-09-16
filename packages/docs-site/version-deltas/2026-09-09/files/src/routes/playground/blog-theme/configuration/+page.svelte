<script module>
  export const frontmatter = {
    title: 'Configuration',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BLOG_CONFIGURATION_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" slug={BLOG_CONFIGURATION_SLUG} />
