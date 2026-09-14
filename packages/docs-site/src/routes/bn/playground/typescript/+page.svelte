<script module>
  export const frontmatter = {
    title: 'Typescript ব্যবহার',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { TYPESCRIPT_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={TYPESCRIPT_SLUG} />
