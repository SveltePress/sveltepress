<script module>
  export const frontmatter = {
    title: 'পোস্ট লেখা',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BLOG_WRITING_POSTS_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={BLOG_WRITING_POSTS_SLUG} />
