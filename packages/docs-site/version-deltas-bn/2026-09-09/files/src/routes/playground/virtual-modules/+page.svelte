<script module>
  export const frontmatter = {
    title: 'ভার্চুয়াল মডিউল',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { VIRTUAL_MODULES_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={VIRTUAL_MODULES_SLUG} />
