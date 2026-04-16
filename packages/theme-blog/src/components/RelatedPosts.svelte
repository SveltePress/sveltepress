<script lang="ts">
  import type { BlogPostMeta } from '../types.js'
  import { base } from '$app/paths'

  interface Props {
    posts: BlogPostMeta[]
  }

  const { posts }: Props = $props()
</script>

{#if posts.length}
  <section class="sp-related" aria-label="Related posts">
    <h2 class="sp-related__title">Related posts</h2>
    <ul class="sp-related__grid">
      {#each posts as p (p.slug)}
        <li>
          <a class="sp-related__card" href={`${base}/posts/${p.slug}/`}>
            <span class="sp-related__date">{p.date}</span>
            <span class="sp-related__heading">{p.title}</span>
            <span class="sp-related__excerpt">{p.excerpt}</span>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .sp-related {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--sp-blog-border);
  }
  .sp-related__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--sp-blog-text);
    margin: 0 0 1rem;
  }
  .sp-related__grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .sp-related__card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 1rem;
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    border-radius: 10px;
    text-decoration: none;
    transition:
      border-color 0.2s,
      transform 0.2s;
  }
  .sp-related__card:hover {
    border-color: var(--sp-blog-primary);
    transform: translateY(-2px);
  }
  .sp-related__date {
    font-size: 0.75rem;
    color: var(--sp-blog-muted);
    font-variant-numeric: tabular-nums;
  }
  .sp-related__heading {
    font-size: 1rem;
    font-weight: 700;
    color: var(--sp-blog-text);
    line-height: 1.35;
  }
  .sp-related__excerpt {
    font-size: 0.85rem;
    color: var(--sp-blog-content);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
