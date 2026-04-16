<script lang="ts">
  import { paginationWindow } from '../pagination.js'

  interface Props {
    page: number
    total: number
    pageSize: number
  }

  const { page, total, pageSize }: Props = $props()
  const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)))
  const items = $derived(paginationWindow(page, totalPages))

  function href(n: number) {
    return n === 1 ? '/' : `/page/${n}/`
  }
</script>

{#if totalPages > 1}
  <nav class="sp-pg" aria-label="Pagination">
    {#if page > 1}
      <a class="sp-pg__nav" href={href(page - 1)}>← Prev</a>
    {/if}
    {#each items as it}
      {#if it === '…'}
        <span class="sp-pg__sep">…</span>
      {:else}
        <a
          class="sp-pg__num"
          class:is-active={it === page}
          href={href(it)}
          aria-current={it === page ? 'page' : undefined}>{it}</a
        >
      {/if}
    {/each}
    {#if page < totalPages}
      <a class="sp-pg__nav" href={href(page + 1)}>Next →</a>
    {/if}
  </nav>
{/if}

<style>
  .sp-pg {
    display: flex;
    gap: 0.35rem;
    justify-content: center;
    flex-wrap: wrap;
    margin: 2rem 0;
    font-size: 0.875rem;
  }
  .sp-pg__num,
  .sp-pg__nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.6rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 6px;
    color: var(--sp-blog-content);
    text-decoration: none;
    background: var(--sp-blog-surface);
    transition:
      border-color 0.15s,
      color 0.15s;
  }
  .sp-pg__num:hover,
  .sp-pg__nav:hover {
    border-color: var(--sp-blog-primary);
    color: var(--sp-blog-primary);
  }
  .sp-pg__num.is-active {
    background: var(--sp-blog-primary);
    border-color: var(--sp-blog-primary);
    color: var(--sp-blog-bg);
    font-weight: 700;
  }
  .sp-pg__sep {
    padding: 0 0.3rem;
    color: var(--sp-blog-muted);
  }
</style>
