<script module>
  export const frontmatter = {
    title: 'Internationalization',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { I18N_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="en" slug={I18N_SLUG} />
