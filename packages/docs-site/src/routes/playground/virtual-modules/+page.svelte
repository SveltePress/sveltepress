<script module>
  export const frontmatter = {
    title: 'Virtual modules',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { VIRTUAL_MODULES_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" slug={VIRTUAL_MODULES_SLUG} />
