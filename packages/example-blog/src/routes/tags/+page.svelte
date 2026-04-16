<script lang="ts">
  import { tags } from 'virtual:sveltepress/blog-tags-index'
</script>

<div class="sp-tags-page">
  <h1 class="sp-tags-page__title">All Tags</h1>
  <div class="sp-tags-page__grid">
    {#each tags as { name, count }}
      <a href="/tags/{name}/" class="sp-tag-pill">
        #{name} <span class="sp-tag-pill__count">{count}</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .sp-tags-page {
    padding: 2rem 0;
  }
  .sp-tags-page__title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--sp-blog-text, #fff7ed);
  }
  .sp-tags-page__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .sp-tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--sp-blog-surface, #2d1200);
    border: 1px solid var(--sp-blog-border, #3f1c04);
    color: var(--sp-blog-primary, #fb923c);
    padding: 0.4rem 0.9rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    transition: background 0.2s;
  }
  .sp-tag-pill:hover {
    background: var(--sp-blog-border, #3f1c04);
    text-decoration: none;
  }
  .sp-tag-pill__count {
    color: var(--sp-blog-muted, #a16207);
    font-size: 0.8rem;
  }
</style>
