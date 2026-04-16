<!-- src/components/TaxonomyHeader.svelte -->
<script lang="ts">
  interface Props {
    name: string
    count: number
    type: 'tag' | 'category'
  }

  const { name, count, type }: Props = $props()
</script>

<header class="sp-taxonomy">
  <p class="sp-taxonomy__type">{type === 'tag' ? '标签' : '分类'}</p>
  <h1 class="sp-taxonomy__name">{name}</h1>
  <p class="sp-taxonomy__count">{count} 篇文章</p>
</header>

<style>
  .sp-taxonomy {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--sp-blog-border);
  }
  .sp-taxonomy__type {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sp-blog-muted);
    margin-bottom: 0.4rem;
  }
  .sp-taxonomy__name {
    font-size: 2rem;
    font-weight: 900;
    color: var(--sp-blog-primary);
    letter-spacing: -0.02em;
  }
  .sp-taxonomy__count {
    font-size: 0.875rem;
    color: var(--sp-blog-muted);
    margin-top: 0.4rem;
  }
</style>
