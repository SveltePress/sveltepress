<script module>
  export const frontmatter = {
    title: 'কাস্টমাইজেশন',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { BLOG_CUSTOMIZATION_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="bn" slug={BLOG_CUSTOMIZATION_SLUG} />
