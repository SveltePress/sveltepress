<script lang="ts">
  import type { MeilisearchProps, SearchResult } from './types.js'
  import { MeiliSearch } from 'meilisearch'
  import { onMount } from 'svelte'

  const {
    host,
    apiKey,
    indexName,
    placeholder = 'Search...',
    limit = 10,
  }: MeilisearchProps = $props()

  let open = $state(false)
  let query = $state('')
  let results = $state<SearchResult[]>([])
  let loading = $state(false)
  let inputEl = $state<HTMLInputElement | undefined>()
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  let client: MeiliSearch | undefined

  onMount(() => {
    client = new MeiliSearch({ host, apiKey })

    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open = !open
        if (open) {
          requestAnimationFrame(() => inputEl?.focus())
        }
      }
      if (e.key === 'Escape' && open) {
        open = false
      }
    }

    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  })

  function handleInput() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => search(), 200)
  }

  async function search() {
    if (!client || !query.trim()) {
      results = []
      return
    }
    loading = true
    try {
      const index = client.index(indexName)
      const res = await index.search(query, {
        limit,
        attributesToHighlight: ['*'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      })
      results = res.hits.map(hit => ({
        id: hit.id as string,
        title: (hit._formatted?.title as string) || (hit.title as string) || '',
        content:
          (hit._formatted?.content as string) || (hit.content as string) || '',
        url: (hit.url as string) || (hit.path as string) || '#',
      }))
    } catch (e) {
      console.error('[sveltepress] Meilisearch error:', e)
      results = []
    } finally {
      loading = false
    }
  }

  function close() {
    open = false
    query = ''
    results = []
  }

  function navigate(url: string) {
    close()
    window.location.href = url
  }
</script>

<button
  class="meilisearch-trigger"
  onclick={() => {
    open = true
    requestAnimationFrame(() => inputEl?.focus())
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
  <span class="meilisearch-trigger-text">Search</span>
  <kbd>
    <span class="meilisearch-kbd-meta">⌘</span>K
  </kbd>
</button>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="meilisearch-overlay" onclick={close} onkeydown={() => {}}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="meilisearch-modal" onclick={e => e.stopPropagation()}>
      <div class="meilisearch-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          bind:this={inputEl}
          bind:value={query}
          oninput={handleInput}
          {placeholder}
          class="meilisearch-input"
          type="text"
          spellcheck="false"
        />
        <button class="meilisearch-close" onclick={close}>
          <kbd>Esc</kbd>
        </button>
      </div>

      <div class="meilisearch-body">
        {#if loading}
          <div class="meilisearch-loading">Searching...</div>
        {:else if query && results.length === 0}
          <div class="meilisearch-empty">No results found for "{query}"</div>
        {:else}
          {#each results as result (result.id)}
            <button
              class="meilisearch-result"
              onclick={() => navigate(result.url)}
            >
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <div class="meilisearch-result-title">{@html result.title}</div>
              {#if result.content}
                <div class="meilisearch-result-content">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html result.content}
                </div>
              {/if}
            </button>
          {/each}
        {/if}
      </div>

      <div class="meilisearch-footer">
        <span
          >Powered by <a
            href="https://www.meilisearch.com"
            target="_blank"
            rel="noopener noreferrer">Meilisearch</a
          ></span
        >
      </div>
    </div>
  </div>
{/if}

<style>
  .meilisearch-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid var(--meilisearch-border, #e2e8f0);
    border-radius: 8px;
    background: var(--meilisearch-bg, #fff);
    color: var(--meilisearch-text, #64748b);
    cursor: pointer;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  .meilisearch-trigger:hover {
    border-color: var(--meilisearch-border-hover, #cbd5e1);
  }

  .meilisearch-trigger-text {
    margin-right: 16px;
  }

  kbd {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border: 1px solid var(--meilisearch-border, #e2e8f0);
    border-radius: 4px;
    font-size: 12px;
    font-family: inherit;
    background: var(--meilisearch-kbd-bg, #f8fafc);
  }

  .meilisearch-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
  }

  .meilisearch-modal {
    width: 90%;
    max-width: 600px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    background: var(--meilisearch-modal-bg, #fff);
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
  }

  .meilisearch-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--meilisearch-border, #e2e8f0);
    color: var(--meilisearch-text, #64748b);
  }

  .meilisearch-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    background: transparent;
    color: var(--meilisearch-input-text, #1e293b);
  }

  .meilisearch-input::placeholder {
    color: var(--meilisearch-text, #64748b);
  }

  .meilisearch-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .meilisearch-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .meilisearch-loading,
  .meilisearch-empty {
    padding: 24px;
    text-align: center;
    color: var(--meilisearch-text, #64748b);
    font-size: 14px;
  }

  .meilisearch-result {
    display: block;
    width: 100%;
    text-align: left;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s;
    color: inherit;
    font-size: inherit;
  }

  .meilisearch-result:hover {
    background: var(--meilisearch-result-hover, #f1f5f9);
  }

  .meilisearch-result-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--meilisearch-input-text, #1e293b);
  }

  .meilisearch-result-title :global(mark) {
    background: var(--meilisearch-highlight, #fbbf24);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }

  .meilisearch-result-content {
    margin-top: 4px;
    font-size: 13px;
    color: var(--meilisearch-text, #64748b);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .meilisearch-result-content :global(mark) {
    background: var(--meilisearch-highlight, #fbbf24);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }

  .meilisearch-footer {
    padding: 8px 16px;
    border-top: 1px solid var(--meilisearch-border, #e2e8f0);
    font-size: 12px;
    color: var(--meilisearch-text, #64748b);
    text-align: right;
  }

  .meilisearch-footer a {
    color: var(--meilisearch-link, #6366f1);
    text-decoration: none;
  }

  .meilisearch-footer a:hover {
    text-decoration: underline;
  }

  :global(.dark) .meilisearch-trigger {
    --meilisearch-border: #334155;
    --meilisearch-bg: #1e293b;
    --meilisearch-text: #94a3b8;
    --meilisearch-kbd-bg: #0f172a;
  }

  :global(.dark) .meilisearch-modal {
    --meilisearch-modal-bg: #1e293b;
    --meilisearch-border: #334155;
    --meilisearch-text: #94a3b8;
    --meilisearch-input-text: #f1f5f9;
    --meilisearch-result-hover: #334155;
    --meilisearch-highlight: #d97706;
    --meilisearch-link: #818cf8;
  }
</style>
