<!-- src/components/PageLayout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  // Intentionally minimal — content is slotted in from +page.svelte
  interface Props {
    children?: Snippet
  }

  const { children }: Props = $props()
</script>

<div class="sp-blog-page">
  {@render children?.()}
</div>

<style>
  .sp-blog-page {
    padding-top: 1rem;
  }
</style>
