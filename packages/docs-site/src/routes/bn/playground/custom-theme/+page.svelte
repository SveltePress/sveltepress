<script module>
  export const frontmatter = {
    title: 'কাস্টম থিম',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { CUSTOM_THEME_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={CUSTOM_THEME_SLUG} />
