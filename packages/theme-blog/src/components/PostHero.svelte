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
  style={coverSrc ? `--hero-bg: url(${coverSrc})` : ''}
>
  <div class="sp-post-hero__overlay">
    {#if post.category}
      <span class="sp-post-hero__cat">{post.category}</span>
    {/if}
    <h1 class="sp-post-hero__title">{post.title}</h1>
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
    font-size: 0.72rem;
    font-weight: 700;
    color: #fdba74;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.6rem;
  }
  .sp-post-hero__title {
    font-size: clamp(1.5rem, 4vw, 2.4rem);
    font-weight: 900;
    color: #fff7ed;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
</style>
