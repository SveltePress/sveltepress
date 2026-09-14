<script module>
  export const frontmatter = {
    title: 'Playground prototype',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { page } from '$app/state'
  import PlaygroundApp from '../PlaygroundApp.svelte'

  const slug = $derived(page.params.slug ?? '')
</script>

<PlaygroundApp {slug} />
