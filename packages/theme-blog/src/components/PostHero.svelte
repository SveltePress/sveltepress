<!-- src/components/PostHero.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import { base } from '$app/paths'

  interface Props {
    post: BlogPost
  }

  const { post }: Props = $props()

  const coverSrc = $derived(
    post.cover && post.cover.startsWith('/') && !post.cover.startsWith('//')
      ? `${base}${post.cover}`
      : post.cover,
  )
</script>

<header
  class="sp-post-hero"
  style={`${coverSrc ? `--hero-bg: url(${coverSrc});` : ''} view-transition-name: sp-cover-${post.slug}`}
>
  <div class="sp-post-hero__overlay">
    {#if post.category}
      <span class="sp-post-hero__cat">{post.category}</span>
    {/if}
    <h1
      class="sp-post-hero__title"
      style="view-transition-name: sp-title-{post.slug}"
    >
      {post.title}
    </h1>
    <p
      class="sp-post-hero__subtitle"
      style="view-transition-name: sp-excerpt-{post.slug}"
    >
      {post.excerpt}
    </p>
  </div>
</header>

<style>
  .sp-post-hero {
    position: relative;
    aspect-ratio: 16 / 7;
    min-height: clamp(200px, 45vw, 280px);
    display: flex;
    align-items: flex-end;
    background-image: var(--hero-bg, linear-gradient(135deg, #ea580c, #9a3412));
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 2rem;
  }
  .sp-post-hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(26, 10, 0, 0.88) 40%,
      rgba(26, 10, 0, 0.2)
    );
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 2rem;
  }
  .sp-post-hero__cat {
    font-family: var(--sp-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    color: #fdba74;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    margin-bottom: 0.625rem;
  }
  .sp-post-hero__title {
    font-family: var(--sp-font-serif);
    font-variation-settings:
      'opsz' 144,
      'wght' 600,
      'SOFT' 60,
      'WONK' 1;
    font-size: clamp(1.75rem, 4.5vw, 2.625rem);
    font-weight: 600;
    color: #fff7ed;
    line-height: 1.02;
    letter-spacing: -0.018em;
  }
  .sp-post-hero__subtitle {
    margin-top: 0.625rem;
    max-width: 52ch;
    font-family: var(--sp-font-serif);
    font-variation-settings:
      'opsz' 36,
      'wght' 400,
      'SOFT' 100,
      'WONK' 1;
    font-style: italic;
    font-size: clamp(0.95rem, 1.4vw, 1.0625rem);
    color: #fde8c8;
    line-height: 1.4;
  }
  .sp-post-hero__subtitle:empty {
    display: none;
  }
</style>
