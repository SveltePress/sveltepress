<script module>
  export const frontmatter = {
    title: 'আন্তর্জাতিকীকরণ',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { I18N_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={I18N_SLUG} />
