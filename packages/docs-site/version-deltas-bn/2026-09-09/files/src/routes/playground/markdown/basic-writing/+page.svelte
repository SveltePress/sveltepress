<script module>
  export const frontmatter = {
    title: 'হাতেখড়ি',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BASIC_WRITING_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={BASIC_WRITING_SLUG} />
