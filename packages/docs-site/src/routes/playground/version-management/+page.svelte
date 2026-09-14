<script module>
  export const frontmatter = {
    title: 'Document versions',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { VERSION_MANAGEMENT_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" slug={VERSION_MANAGEMENT_SLUG} />
