<!-- src/components/MasonryGrid.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import PostCardFeatured from './PostCardFeatured.svelte'
  import PostCardLarge from './PostCardLarge.svelte'
  import PostCardSmall from './PostCardSmall.svelte'

  interface Props {
    posts: BlogPost[]
  }

  const { posts }: Props = $props()

  // First post becomes the featured card
  const featured = $derived(posts[0])
  const gridPosts = $derived(posts.slice(1))
</script>

<div class="sp-masonry-wrap">
  {#if featured}
    <PostCardFeatured post={featured} />
  {/if}

  <div class="sp-masonry">
    {#each gridPosts as post (post.slug)}
      {#if post.cover}
        <PostCardLarge {post} />
      {:else}
        <PostCardSmall {post} />
      {/if}
    {/each}
  </div>
</div>

<style>
  .sp-masonry-wrap {
  }
  .sp-masonry {
    columns: 1;
    column-gap: 1rem;
  }
  @media (min-width: 640px) {
    .sp-masonry {
      columns: 2;
    }
  }
  @media (min-width: 1024px) {
    .sp-masonry {
      columns: 3;
    }
  }
</style>
