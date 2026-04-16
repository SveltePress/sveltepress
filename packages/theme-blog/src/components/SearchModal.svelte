<!-- src/components/SearchModal.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    open: boolean
    onClose: () => void
  }

  interface SearchResult {
    url: string
    meta: any
    excerpt: string
  }

  const { open, onClose }: Props = $props()

  let query = $state('')
  let results: SearchResult[] = $state([])
  let selected = $state(0)
  let pagefind: any = $state(null)
  let loading = $state(false)
  let input: HTMLInputElement | undefined = $state()

  async function ensureLoaded() {
    if (pagefind) return
    loading = true
    try {
      // Path is site-absolute; Pagefind places its runtime at /pagefind/
      // Build the URL at runtime so Rollup cannot try to resolve it at build time.
      const url = `${window.location.origin}/pagefind/pagefind.js`
      // @ts-expect-error — runtime virtual import
      pagefind = await import(/* @vite-ignore */ url)
      await pagefind.init()
    } finally {
      loading = false
    }
  }

  let timer: any
  $effect(() => {
    if (!open) return
    ensureLoaded()
    input?.focus()
  })

  async function runSearch(q: string) {
    if (!pagefind || !q) {
      results = []
      return
    }
    const search = await pagefind.search(q)
    const top = await Promise.all(
      search.results.slice(0, 10).map((r: any) => r.data()),
    )
    results = top.map((r: any) => ({
      url: r.url,
      meta: r.meta,
      excerpt: r.excerpt,
    }))
    selected = 0
  }

  function onInput(e: Event) {
    query = (e.target as HTMLInputElement).value
    clearTimeout(timer)
    timer = setTimeout(() => runSearch(query), 200)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      selected = Math.min(results.length - 1, selected + 1)
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      selected = Math.max(0, selected - 1)
      e.preventDefault()
    } else if (e.key === 'Enter' && results[selected]) {
      window.location.href = results[selected].url
    }
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (!open) dispatchEvent(new CustomEvent('sp-search-open'))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
</script>

{#if open}
  <div class="sp-search-backdrop" onclick={onClose} role="presentation"></div>
  <div class="sp-search" role="dialog" aria-modal="true" aria-label="Search">
    <input
      bind:this={input}
      class="sp-search__input"
      placeholder={loading ? 'Loading…' : 'Search posts…'}
      value={query}
      oninput={onInput}
      onkeydown={onKeydown}
    />
    {#if results.length}
      <ul class="sp-search__results">
        {#each results as r, i}
          <li class="sp-search__item" class:is-selected={i === selected}>
            <a href={r.url}>
              <strong>{r.meta?.title ?? r.url}</strong>
              <!-- pagefind returns already-marked excerpt as HTML -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <p>{@html r.excerpt}</p>
            </a>
          </li>
        {/each}
      </ul>
    {:else if query && !loading}
      <p class="sp-search__empty">No results.</p>
    {/if}
  </div>
{/if}

<style>
  .sp-search-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100;
  }
  .sp-search {
    position: fixed;
    top: 10vh;
    left: 50%;
    transform: translateX(-50%);
    width: min(640px, 92vw);
    z-index: 101;
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    border-radius: 10px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    max-height: 70vh;
  }
  .sp-search__input {
    padding: 0.9rem 1rem;
    background: transparent;
    border: none;
    outline: none;
    color: var(--sp-blog-text);
    font-size: 1rem;
    border-bottom: 1px solid var(--sp-blog-border);
  }
  .sp-search__results {
    list-style: none;
    margin: 0;
    padding: 0.5rem;
    overflow: auto;
  }
  .sp-search__item a {
    display: block;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    color: var(--sp-blog-content);
    text-decoration: none;
  }
  .sp-search__item.is-selected a {
    background: var(--sp-blog-border);
    color: var(--sp-blog-primary);
  }
  .sp-search__item p {
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    color: var(--sp-blog-muted);
  }
  .sp-search__item :global(mark) {
    background: var(--sp-blog-primary);
    color: var(--sp-blog-bg);
    padding: 0 2px;
    border-radius: 2px;
  }
  .sp-search__empty {
    padding: 1rem;
    color: var(--sp-blog-muted);
    text-align: center;
  }
</style>
