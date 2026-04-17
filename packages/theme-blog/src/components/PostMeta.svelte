<!-- src/components/PostMeta.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import { base } from '$app/paths'
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  interface Props {
    post: BlogPost
  }

  const { post }: Props = $props()
  const avatar = $derived(blogConfig.author?.avatar)

  function href(to: string) {
    if (/^(?:[a-z]+:)?\/\//i.test(to)) return to
    return to.startsWith('/') ? `${base}${to}` : to
  }
</script>

<div class="sp-post-meta">
  {#if avatar}
    <img
      class="sp-post-meta__avatar"
      src={href(avatar)}
      alt=""
      width="24"
      height="24"
    />
  {/if}
  {#if post.author}
    <span class="sp-post-meta__author">By <b>{post.author}</b></span>
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
  {#if post.category}
    <span class="sp-post-meta__sep">·</span>
    <span class="sp-post-meta__filed">Filed under <b>{post.category}</b></span>
  {/if}
  {#if post.tags.length}
    <div class="sp-post-meta__tags">
      {#each post.tags as tag, i (tag)}
        <a
          href={`${base}/tags/${tag}/`}
          class="sp-post-meta__tag"
          style="view-transition-name: sp-tag-{post.slug}-{i}">{tag}</a
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
    gap: 0.6rem;
    padding: 0.875rem 0;
    border-top: 1px solid var(--sp-blog-border);
    border-bottom: 1px solid var(--sp-blog-border);
    margin-bottom: 1.75rem;
    font-family: var(--sp-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sp-blog-muted);
  }
  .sp-post-meta__avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }
  .sp-post-meta__sep {
    color: var(--sp-blog-border);
  }
  .sp-post-meta__author b,
  .sp-post-meta__filed b {
    font-weight: 600;
    color: var(--sp-blog-text);
  }
  .sp-post-meta__tags {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    margin-left: auto;
  }
  .sp-post-meta__tag {
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    color: var(--sp-blog-primary);
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
  }
  .sp-post-meta__tag:hover {
    background: var(--sp-blog-border);
  }
</style>
