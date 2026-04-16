<!-- src/components/SearchModal.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation'

  interface Props {
    open: boolean
    onClose: () => void
  }

  interface PagefindMeta {
    title?: string
    [k: string]: unknown
  }

  interface PagefindResultData {
    url: string
    meta: PagefindMeta
    excerpt: string
  }

  interface PagefindRuntime {
    init: () => Promise<void>
    search: (q: string) => Promise<{
      results: Array<{ data: () => Promise<PagefindResultData> }>
    }>
  }

  const { open, onClose }: Props = $props()

  let query = $state('')
  let results: PagefindResultData[] = $state([])
  let selected = $state(0)
  let pagefind: PagefindRuntime | null = null
  let loading = $state(false)
  let loadError = $state(false)
  let input: HTMLInputElement | undefined = $state()

  let timer: ReturnType<typeof setTimeout> | undefined

  async function ensureLoaded() {
    if (pagefind) return
    loading = true
    try {
      // Path is site-absolute; Pagefind places its runtime at /pagefind/
      // Build the URL at runtime so Rollup cannot try to resolve it at build time.
      const url = `${window.location.origin}/pagefind/pagefind.js`
      // @ts-expect-error — runtime virtual import
      pagefind = (await import(/* @vite-ignore */ url)) as PagefindRuntime
      await pagefind.init()
      loadError = false
    } catch (err) {
      console.warn('[sveltepress] Pagefind runtime failed to load:', err)
      pagefind = null
      loadError = true
    } finally {
      loading = false
    }
  }

  // When the modal opens: load Pagefind, focus input, remember the opener
  // so we can restore focus on close.
  $effect(() => {
    if (!open) return
    ensureLoaded()
    const opener = document.activeElement as HTMLElement | null
    // Focus after mount
    queueMicrotask(() => input?.focus())
    return () => {
      opener?.focus()
    }
  })

  // Reset transient search state whenever the modal closes. Without this a
  // fast-typed search followed by Esc would fire runSearch against a closed
  // modal, and the next open would flash stale results.
  $effect(() => {
    if (open) return
    clearTimeout(timer)
    timer = undefined
    query = ''
    results = []
    selected = 0
  })

  async function runSearch(q: string) {
    if (!pagefind || !q) {
      results = []
      return
    }
    const search = await pagefind.search(q)
    const top = await Promise.all(
      search.results.slice(0, 10).map(r => r.data()),
    )
    results = top.map(({ url, meta, excerpt }) => ({ url, meta, excerpt }))
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
      goto(results[selected].url)
    } else if (e.key === 'Tab') {
      // Focus trap: the dialog has a single focusable control (the input).
      // Swallowing Tab keeps focus inside the aria-modal dialog.
      e.preventDefault()
    }
  }
</script>

{#if open}
  <button
    type="button"
    class="sp-search-backdrop"
    aria-label="Close search"
    onclick={onClose}
  ></button>
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
              <!-- Pagefind returns excerpt HTML with <mark> wrapping matches.
                   Trust model: site content is author-trusted. If you render
                   untrusted user-submitted content, sanitise before indexing. -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <p>{@html r.excerpt}</p>
            </a>
          </li>
        {/each}
      </ul>
    {:else if loadError && !loading}
      <p class="sp-search__empty">Search unavailable.</p>
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
    border: none;
    padding: 0;
    cursor: pointer;
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
