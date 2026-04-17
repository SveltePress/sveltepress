<!-- src/components/PostMeta.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import { base } from '$app/paths'

  interface Props {
    post: BlogPost
  }

  const { post }: Props = $props()
</script>

<div class="sp-post-meta">
  {#if post.author}
    <span class="sp-post-meta__author">{post.author}</span>
    <span class="sp-post-meta__sep">·</span>
  {/if}
  <time
    class="sp-post-meta__date"
    style="view-transition-name: sp-date-{post.slug}">{post.date}</time
  >
  <span class="sp-post-meta__sep">·</span>
  <span style="view-transition-name: sp-reading-{post.slug}"
    >{post.readingTime} min read</span
  >
  {#if post.tags.length}
    <span class="sp-post-meta__sep">·</span>
    <div class="sp-post-meta__tags">
      {#each post.tags as tag, i}
        <a
          href={`${base}/tags/${tag}/`}
          class="sp-post-meta__tag"
          style={i === 0
            ? `view-transition-name: sp-tag-${post.slug}`
            : undefined}>{tag}</a
        >
      {/each}
    </div>
  {/if}
</div>

<style>
  .sp-post-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--sp-blog-muted);
    margin-bottom: 2rem;
  }
  .sp-post-meta__sep {
    color: var(--sp-blog-border);
  }
  .sp-post-meta__author {
    font-weight: 600;
    color: var(--sp-blog-content);
  }
  .sp-post-meta__tags {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .sp-post-meta__tag {
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    color: var(--sp-blog-primary);
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 600;
    text-decoration: none;
  }
  .sp-post-meta__tag:hover {
    background: var(--sp-blog-border);
  }
</style>
