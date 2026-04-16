<!-- src/components/PostLayout.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
  import PostHero from './PostHero.svelte'
  import PostMeta from './PostMeta.svelte'
  import PostNav from './PostNav.svelte'
  import TableOfContents from './TableOfContents.svelte'

  interface Props {
    post: BlogPost
    prev?: BlogPost
    next?: BlogPost
  }

  const { post, prev, next }: Props = $props()
  const siteTitle = blogConfig.title ?? 'Blog'
</script>

<svelte:head>
  <title>{post.title} | {siteTitle}</title>
</svelte:head>

<article class="sp-post">
  <PostHero {post} />
  <div class="sp-post__body">
    <div class="sp-post__content-wrap">
      <PostMeta {post} />
      <div class="sp-post-content">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html post.contentHtml}
      </div>
      <PostNav {prev} {next} />
    </div>
    <aside class="sp-post__toc">
      <TableOfContents />
    </aside>
  </div>
</article>

<style>
  .sp-post__body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .sp-post__body {
      grid-template-columns: 1fr 220px;
    }
  }
  .sp-post__content-wrap {
    min-width: 0;
  }
  .sp-post-content {
    line-height: 1.75;
    color: var(--sp-blog-content);
  }
  .sp-post-content :global(h2),
  .sp-post-content :global(h3) {
    color: var(--sp-blog-text);
    font-weight: 700;
    margin: 2rem 0 0.75rem;
  }
  .sp-post-content :global(h2) {
    font-size: 1.35rem;
  }
  .sp-post-content :global(h3) {
    font-size: 1.1rem;
  }
  .sp-post-content :global(p) {
    margin-bottom: 1.15rem;
  }
  .sp-post-content :global(code) {
    background: var(--sp-blog-surface);
    color: var(--sp-blog-primary);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.875em;
  }
  .sp-post-content :global(pre) {
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    margin-bottom: 1.25rem;
  }
  .sp-post-content :global(pre code) {
    background: none;
    padding: 0;
    color: inherit;
  }
  .sp-post-content :global(blockquote) {
    border-left: 3px solid var(--sp-blog-primary);
    padding-left: 1rem;
    color: var(--sp-blog-muted);
    margin: 1.25rem 0;
  }
  .sp-post-content :global(a) {
    color: var(--sp-blog-primary);
  }
  .sp-post__toc {
    display: none;
  }
  @media (min-width: 1024px) {
    .sp-post__toc {
      display: block;
    }
  }
</style>
