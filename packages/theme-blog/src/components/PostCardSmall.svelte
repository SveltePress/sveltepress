<!-- src/components/PostCardSmall.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'

  interface Props {
    post: BlogPost
  }

  const { post }: Props = $props()
</script>

<article class="sp-card-small">
  <a href={`/posts/${post.slug}`} class="sp-card-small__link">
    {#if post.tags[0]}
      <span class="sp-card__tag">{post.tags[0]}</span>
    {/if}
    <h2 class="sp-card-small__title">{post.title}</h2>
    <p class="sp-card-small__quote">{post.excerpt}</p>
    <div class="sp-card__meta">
      <time>{post.date}</time>
      <span>{post.readingTime} min read</span>
    </div>
  </a>
</article>

<style>
  .sp-card-small {
    background: var(--sp-blog-surface);
    border-radius: 10px;
    overflow: hidden;
    break-inside: avoid;
    margin-bottom: 1rem;
    border-left: 4px solid var(--sp-blog-primary);
    transition: transform 0.2s;
  }
  .sp-card-small:hover {
    transform: translateY(-3px);
  }
  .sp-card-small__link {
    display: block;
    text-decoration: none;
    color: inherit;
    padding: 1rem 1rem 1rem 0.875rem;
  }
  .sp-card-small__title {
    font-size: 0.95rem;
    font-weight: 800;
    color: #fff7ed;
    margin: 0.3rem 0 0.45rem;
    line-height: 1.35;
  }
  .sp-card-small__quote {
    font-size: 0.8rem;
    color: var(--sp-blog-muted);
    line-height: 1.5;
  }
  .sp-card__tag {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--sp-blog-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .sp-card__meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: #78350f;
    margin-top: 0.75rem;
  }
</style>
