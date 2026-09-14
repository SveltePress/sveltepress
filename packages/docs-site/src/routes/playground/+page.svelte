<script module>
  export const frontmatter = {
    title: 'Playground',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" />
