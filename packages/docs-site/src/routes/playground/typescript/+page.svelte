<script module>
  export const frontmatter = {
    title: 'Working with TypeScript',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { TYPESCRIPT_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" slug={TYPESCRIPT_SLUG} />
