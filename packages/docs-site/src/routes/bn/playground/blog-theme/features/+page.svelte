<script module>
  export const frontmatter = {
    title: 'ফিচারসমূহ',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BLOG_FEATURES_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={BLOG_FEATURES_SLUG} />
