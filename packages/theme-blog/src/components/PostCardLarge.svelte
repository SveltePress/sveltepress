<!-- src/components/PostCardLarge.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'

  interface Props {
    post: BlogPost
  }

  const { post }: Props = $props()

  // Hash tag name to one of the Ember gradients for cover fallback
  const GRADIENTS = [
    'linear-gradient(135deg,#ea580c,#dc2626)',
    'linear-gradient(135deg,#f59e0b,#ea580c)',
    'linear-gradient(135deg,#c2410c,#9a3412)',
    'linear-gradient(135deg,#b45309,#d97706)',
    'linear-gradient(135deg,#dc2626,#7c2d12)',
  ]
  function tagGradient(tag: string): string {
    let hash = 0
    for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return GRADIENTS[hash % GRADIENTS.length]
  }
  const gradient = $derived(
    post.tags[0] ? tagGradient(post.tags[0]) : GRADIENTS[0],
  )
</script>

<article class="sp-card-large">
  <a href={`/posts/${post.slug}`} class="sp-card-large__link">
    {#if post.cover}
      <img src={post.cover} alt={post.title} class="sp-card-large__cover" />
    {:else}
      <div
        class="sp-card-large__cover sp-card-large__cover--gradient"
        style="background:{gradient}"
      ></div>
    {/if}
    <div class="sp-card-large__body">
      {#if post.tags[0]}
        <span class="sp-card__tag">{post.tags[0]}</span>
      {/if}
      <h2 class="sp-card-large__title">{post.title}</h2>
      <p class="sp-card-large__excerpt">{post.excerpt}</p>
      <div class="sp-card__meta">
        <time>{post.date}</time>
        <span>{post.readingTime} min read</span>
      </div>
    </div>
  </a>
</article>

<style>
  .sp-card-large {
    background: var(--sp-blog-surface);
    border-radius: 10px;
    overflow: hidden;
    break-inside: avoid;
    margin-bottom: 1rem;
    transition: transform 0.2s;
  }
  .sp-card-large:hover {
    transform: translateY(-3px);
  }
  .sp-card-large__link {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .sp-card-large__cover {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
  }
  .sp-card-large__cover--gradient {
  }
  .sp-card-large__body {
    padding: 1rem;
  }
  .sp-card-large__title {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--sp-blog-text);
    margin: 0.35rem 0 0.5rem;
    line-height: 1.3;
  }
  .sp-card-large__excerpt {
    font-size: 0.825rem;
    color: var(--sp-blog-muted);
    line-height: 1.55;
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
    color: var(--sp-blog-muted);
    margin-top: 0.75rem;
  }
</style>
