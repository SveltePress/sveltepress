<script lang="ts">
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { page } from '$app/state'
  import { tick } from 'svelte'
  import { resolveLocaleOptions } from '../locale.js'

  interface SearchResultItem {
    url: string
    meta?: {
      title?: string
    }
    excerpt?: string
  }

  const { class: className = '' }: { class?: string } = $props()

  let isOpen = $state(false)
  let query = $state('')
  let results = $state<SearchResultItem[]>([])
  let selectedIndex = $state(0)
  let loading = $state(false)
  let isDevNotice = $state(false)
  let inputEl = $state<HTMLInputElement | null>(null)
  let pagefind = $state<any>(null)

  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const placeholder = $derived(
    localeOptions.i18n?.searchPlaceholder || 'Search documentation...',
  )
  const noResultsText = $derived(
    localeOptions.i18n?.searchNoResults || 'No results found for "{query}"',
  )
  const devNotice = $derived.by(() => {
    return (
      localeOptions.i18n?.searchDevNotice ||
      'Local search index is generated during production build.'
    )
  })
  const clearText = $derived(localeOptions.i18n?.searchClear || 'Clear search')

  function checkIsMac(): boolean {
    if (typeof navigator === 'undefined') return false
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  }
  const shortcutModifier = checkIsMac() ? '⌘' : 'Ctrl'

  async function loadPagefind() {
    if (pagefind) return pagefind
    loading = true
    try {
      const pagefindUrl = `${base}/pagefind/pagefind.js`.replace(/\/+/g, '/')
      const pf = await import(/* @vite-ignore */ pagefindUrl)
      const currentLang =
        typeof document !== 'undefined'
          ? document.documentElement.lang || 'en'
          : 'en'
      await pf.options?.({
        basePath: `${base}/pagefind/`.replace(/\/+/g, '/'),
        language: currentLang,
      })
      await pf.init?.()
      pagefind = pf
      isDevNotice = false
      return pf
    } catch {
      isDevNotice = true
      return null
    } finally {
      loading = false
    }
  }

  async function openModal() {
    isOpen = true
    query = ''
    results = []
    selectedIndex = 0
    await tick()
    inputEl?.focus()
    loadPagefind()
  }

  function closeModal() {
    isOpen = false
    query = ''
    results = []
    selectedIndex = 0
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      if (isOpen) closeModal()
      else openModal()
    }
    if (isOpen && e.key === 'Escape') {
      e.preventDefault()
      closeModal()
    }
  }

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (results.length > 0) {
        selectedIndex = (selectedIndex + 1) % results.length
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (results.length > 0) {
        selectedIndex = (selectedIndex - 1 + results.length) % results.length
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        navigateTo(results[selectedIndex].url)
      }
    }
  }

  async function performSearch(q: string) {
    const pf = await loadPagefind()
    if (!pf) return
    loading = true
    try {
      const searchRes = await pf.search(q)
      if (!searchRes || !searchRes.results) {
        results = []
        return
      }
      const slice = searchRes.results.slice(0, 8)
      const loaded: SearchResultItem[] = await Promise.all(
        slice.map((r: any) => r.data()),
      )
      results = loaded
      selectedIndex = 0
    } catch {
      results = []
    } finally {
      loading = false
    }
  }

  $effect(() => {
    const q = query.trim()
    if (!isOpen) return
    if (!q) {
      results = []
      selectedIndex = 0
      return
    }
    const timer = setTimeout(() => {
      performSearch(q)
    }, 150)
    return () => clearTimeout(timer)
  })

  async function navigateTo(url: string) {
    closeModal()
    if (url.startsWith('/')) {
      await goto(url)
    } else {
      window.location.href = url
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<button
  type="button"
  class="local-search-trigger {className}"
  aria-label={placeholder}
  onclick={openModal}
>
  <span class="trigger-icon">
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  </span>
  <span class="trigger-placeholder">{placeholder}</span>
  <span class="trigger-shortcut">
    <kbd class="shortcut-key">{shortcutModifier}</kbd>
    <kbd class="shortcut-key">K</kbd>
  </span>
</button>

{#if isOpen}
  <div
    class="local-search-backdrop"
    onclick={handleBackdropClick}
    onkeydown={e => {
      if (e.key === 'Escape') closeModal()
    }}
    role="presentation"
  >
    <div
      class="local-search-modal"
      role="dialog"
      aria-modal="true"
      aria-label={placeholder}
      tabindex="-1"
    >
      <div class="search-header">
        <span class="header-search-icon">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          bind:this={inputEl}
          bind:value={query}
          type="text"
          class="search-input"
          {placeholder}
          onkeydown={handleInputKeydown}
        />
        {#if query}
          <button
            type="button"
            class="clear-button"
            onclick={() => {
              query = ''
              inputEl?.focus()
            }}
            aria-label={clearText}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        {/if}
        <button type="button" class="esc-button" onclick={closeModal}>
          ESC
        </button>
      </div>

      <div class="search-body">
        {#if isDevNotice}
          <div class="dev-notice">
            <div class="notice-icon">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <p class="notice-text">{devNotice}</p>
          </div>
        {:else if loading}
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        {:else if query && results.length === 0}
          <div class="no-results">
            {noResultsText.replace('{query}', query)}
          </div>
        {:else if results.length > 0}
          <ul class="results-list" role="listbox">
            {#each results as result, idx}
              <li
                role="option"
                aria-selected={idx === selectedIndex}
                class="result-item"
                class:selected={idx === selectedIndex}
                onclick={() => navigateTo(result.url)}
                onkeydown={e => {
                  if (e.key === 'Enter') navigateTo(result.url)
                }}
                onmouseenter={() => {
                  selectedIndex = idx
                }}
              >
                <div class="result-title">
                  <span class="title-text"
                    >{result.meta?.title || result.url}</span
                  >
                  <span class="result-url">{result.url}</span>
                </div>
                {#if result.excerpt}
                  <div class="result-excerpt">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html result.excerpt}
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="search-footer">
        <div class="footer-shortcuts">
          <span class="shortcut-tip"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span class="shortcut-tip"><kbd>↵</kbd> select</span>
          <span class="shortcut-tip"><kbd>esc</kbd> close</span>
        </div>
        <div class="footer-brand">Powered by Pagefind</div>
      </div>
    </div>
  </div>
{/if}

<style>
  .local-search-trigger {
    --at-apply: 'h-9 px-3 flex items-center justify-between gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 text-xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer';
    min-width: 140px;
    max-width: 220px;
  }

  .trigger-icon {
    --at-apply: 'flex items-center text-zinc-400 dark:text-zinc-500 flex-none';
  }

  .trigger-placeholder {
    --at-apply: 'truncate flex-1 text-left';
  }

  .trigger-shortcut {
    --at-apply: 'hidden sm:flex items-center gap-0.5 flex-none';
  }

  .shortcut-key {
    --at-apply: 'px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400 border border-zinc-300/40 dark:border-zinc-600/40';
  }

  .local-search-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem;
    padding-top: 10vh;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
  }

  .local-search-modal {
    width: 100%;
    max-width: 640px;
    max-height: 75vh;
    background-color: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :global(.dark) .local-search-modal {
    background-color: #18181b;
    border-color: #27272a;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .search-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #e4e4e7;
  }

  :global(.dark) .search-header {
    border-bottom-color: #27272a;
  }

  .header-search-icon {
    color: #a1a1aa;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1rem;
    color: #18181b;
  }

  :global(.dark) .search-input {
    color: #f4f4f5;
  }

  .search-input::placeholder {
    color: #a1a1aa;
  }

  .clear-button {
    background: transparent;
    border: none;
    color: #a1a1aa;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
  }

  .clear-button:hover {
    color: #52525b;
  }

  :global(.dark) .clear-button:hover {
    color: #e4e4e7;
  }

  .esc-button {
    font-size: 0.625rem;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    padding: 0.2rem 0.4rem;
    color: #71717a;
    background-color: #f4f4f5;
    border: 1px solid #e4e4e7;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  :global(.dark) .esc-button {
    color: #a1a1aa;
    background-color: #27272a;
    border-color: #3f3f46;
  }

  .search-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .dev-notice,
  .no-results {
    padding: 2.5rem 1.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: #71717a;
  }

  :global(.dark) .dev-notice,
  :global(.dark) .no-results {
    color: #a1a1aa;
  }

  .notice-icon {
    color: #f59e0b;
    margin-bottom: 0.5rem;
  }

  .loading-state {
    padding: 2rem;
    display: flex;
    justify-content: center;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e4e4e7;
    border-top-color: var(--svp-primary, #e11d48);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .results-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .result-item {
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .result-item.selected {
    background-color: #f4f4f5;
  }

  :global(.dark) .result-item.selected {
    background-color: #27272a;
  }

  .result-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #18181b;
  }

  :global(.dark) .result-title {
    color: #f4f4f5;
  }

  .result-item.selected .title-text {
    color: var(--svp-primary, #e11d48);
  }

  .result-url {
    font-size: 0.75rem;
    font-weight: 400;
    color: #a1a1aa;
  }

  .result-excerpt {
    font-size: 0.75rem;
    color: #71717a;
    margin-top: 0.25rem;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  :global(.dark) .result-excerpt {
    color: #a1a1aa;
  }

  .result-excerpt :global(mark) {
    background: transparent;
    color: var(--svp-primary, #e11d48);
    font-weight: 600;
    text-decoration: underline;
  }

  .search-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1rem;
    background-color: #fafafa;
    border-top: 1px solid #e4e4e7;
    font-size: 0.75rem;
    color: #a1a1aa;
  }

  :global(.dark) .search-footer {
    background-color: #141416;
    border-top-color: #27272a;
  }

  .footer-shortcuts {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .shortcut-tip {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .shortcut-tip kbd {
    padding: 0.125rem 0.25rem;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background-color: #f4f4f5;
    border: 1px solid #e4e4e7;
    border-radius: 0.25rem;
    font-size: 0.625rem;
  }

  :global(.dark) .shortcut-tip kbd {
    background-color: #27272a;
    border-color: #3f3f46;
  }

  .footer-brand {
    font-size: 0.6875rem;
  }
</style>
