<script module>
  export const frontmatter = {
    title: 'Features',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BLOG_FEATURES_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" slug={BLOG_FEATURES_SLUG} />
