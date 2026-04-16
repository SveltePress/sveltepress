<!-- src/components/PostCardFeatured.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'

  interface Props {
    post: BlogPost
  }

  const { post }: Props = $props()
</script>

<article class="sp-card-featured">
  <a href={`/posts/${post.slug}`} class="sp-card-featured__link">
    <div
      class="sp-card-featured__bg"
      style={post.cover
        ? `background-image:url(${post.cover})`
        : 'background:linear-gradient(135deg,#ea580c 0%,#dc2626 50%,#9a3412 100%)'}
    >
      <div class="sp-card-featured__overlay">
        {#if post.tags[0]}
          <span class="sp-card-featured__tag">{post.tags[0]}</span>
        {/if}
        <h2 class="sp-card-featured__title">{post.title}</h2>
        <p class="sp-card-featured__excerpt">{post.excerpt}</p>
        <div class="sp-card__meta sp-card__meta--light">
          <time>{post.date}</time>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </div>
  </a>
</article>

<style>
  .sp-card-featured {
    border-radius: 12px;
    overflow: hidden;
    break-inside: avoid;
    margin-bottom: 1rem;
    transition: transform 0.2s;
  }
  .sp-card-featured:hover {
    transform: translateY(-3px);
  }
  .sp-card-featured__link {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .sp-card-featured__bg {
    background-size: cover;
    background-position: center;
    min-height: 220px;
    position: relative;
  }
  .sp-card-featured__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(26, 10, 0, 0.92) 40%, transparent);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 1.25rem;
  }
  .sp-card-featured__tag {
    font-size: 0.7rem;
    font-weight: 700;
    color: #fdba74;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: rgba(234, 88, 12, 0.35);
    padding: 2px 8px;
    border-radius: 3px;
    display: inline-block;
    margin-bottom: 0.5rem;
    width: fit-content;
  }
  .sp-card-featured__title {
    font-size: 1.3rem;
    font-weight: 900;
    color: #fff7ed;
    line-height: 1.25;
    margin-bottom: 0.5rem;
  }
  .sp-card-featured__excerpt {
    font-size: 0.85rem;
    color: #d6d3d1;
    line-height: 1.5;
  }
  .sp-card__meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: #78350f;
    margin-top: 0.75rem;
  }
  .sp-card__meta--light {
    color: #a8a29e;
  }
</style>
