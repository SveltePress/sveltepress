<script module>
  export const frontmatter = {
    title: '与 Typescript 一起开发',
    layout: false,
    sidebar: false,
  }
</script>

<script>
  import { TYPESCRIPT_SLUG } from '$lib/playground/catalog.ts'
  import PlaygroundApp from '$lib/playground/PlaygroundApp.svelte'
</script>

<PlaygroundApp locale="zh" slug={TYPESCRIPT_SLUG} />
