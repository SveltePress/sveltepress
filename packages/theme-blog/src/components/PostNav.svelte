<!-- src/components/PostNav.svelte -->
<script lang="ts">
  import type { BlogPostMeta } from '../types.js'

  interface Props {
    prev?: BlogPostMeta | null
    next?: BlogPostMeta | null
  }

  const { prev, next }: Props = $props()
</script>

<nav class="sp-post-nav">
  {#if prev}
    <a
      href={`/posts/${prev.slug}`}
      class="sp-post-nav__item sp-post-nav__item--prev"
    >
      <span class="sp-post-nav__dir">← 上一篇</span>
      <span class="sp-post-nav__title">{prev.title}</span>
    </a>
  {:else}
    <div></div>
  {/if}
  {#if next}
    <a
      href={`/posts/${next.slug}`}
      class="sp-post-nav__item sp-post-nav__item--next"
    >
      <span class="sp-post-nav__dir">下一篇 →</span>
      <span class="sp-post-nav__title">{next.title}</span>
    </a>
  {/if}
</nav>

<style>
  .sp-post-nav {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--sp-blog-border);
  }
  .sp-post-nav__item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-width: 45%;
    text-decoration: none;
  }
  .sp-post-nav__item--next {
    align-items: flex-end;
  }
  .sp-post-nav__dir {
    font-size: 0.75rem;
    color: var(--sp-blog-muted);
  }
  .sp-post-nav__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--sp-blog-primary);
    line-height: 1.4;
  }
  .sp-post-nav__item:hover .sp-post-nav__title {
    text-decoration: underline;
  }
</style>
