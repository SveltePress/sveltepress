<script module>
  export const frontmatter = {
    title: 'ডকুমেন্ট সংস্করণ ব্যবস্থাপনা',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { VERSION_MANAGEMENT_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={VERSION_MANAGEMENT_SLUG} />
