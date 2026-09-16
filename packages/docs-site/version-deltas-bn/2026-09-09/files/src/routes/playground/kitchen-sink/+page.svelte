<script module>
  export const frontmatter = {
    title: 'Kitchen sink',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { KITCHEN_SINK_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={KITCHEN_SINK_SLUG} />
