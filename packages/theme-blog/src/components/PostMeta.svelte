<!-- src/components/PostMeta.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'

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
  <time class="sp-post-meta__date">{post.date}</time>
  <span class="sp-post-meta__sep">·</span>
  <span>{post.readingTime} min read</span>
  {#if post.tags.length}
    <span class="sp-post-meta__sep">·</span>
    <div class="sp-post-meta__tags">
      {#each post.tags as tag}
        <a href={`/tags/${tag}`} class="sp-post-meta__tag">{tag}</a>
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
    color: #d6d3d1;
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
