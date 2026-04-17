<!-- src/components/SideRail.svelte -->
<!-- Vertical "Issue · {blogTitle} · {category}" text sticky inside the TOC
     aside. Pure decorative editorial signature; hidden when no category. -->
<script lang="ts">
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  interface Props {
    category?: string
  }

  const { category }: Props = $props()
  const blogTitle = $derived(blogConfig.title ?? 'Blog')
</script>

{#if category}
  <div class="sp-siderail" aria-hidden="true">
    Issue · {blogTitle} · {category}
  </div>
{/if}

<style>
  .sp-siderail {
    position: absolute;
    top: 0;
    right: 0;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: var(--sp-font-sans);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--sp-blog-muted);
    opacity: 0.55;
    pointer-events: none;
  }
</style>
