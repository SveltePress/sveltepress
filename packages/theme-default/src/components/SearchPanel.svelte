<script>
  import MiniSearch from 'minisearch'
  import { onDestroy, onMount, tick } from 'svelte'
  import { searchDocuments } from 'virtual:sveltepress/search-index'

  let show = $state(false)
  let query = $state('')
  let results = $state([])
  let activeIndex = $state(0)
  let inputEl = $state(null)
  let listEl = $state(null)

  const miniSearch = new MiniSearch({
    fields: ['title', 'headings', 'content'],
    idField: 'id',
    searchOptions: {
      boost: { title: 3, headings: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
    storeFields: ['title', 'href', 'content'],
    extractField: (doc, fieldName) => {
      if (fieldName === 'headings') return doc.headings?.join(' ') ?? ''
      return doc[fieldName]
    },
  })

  miniSearch.addAll(searchDocuments)

  function open() {
    show = true
    query = ''
    results = []
    activeIndex = 0
    tick().then(() => inputEl?.focus())
  }

  function close() {
    show = false
    query = ''
    results = []
  }

  function search(q) {
    if (!q.trim()) {
      results = []
      activeIndex = 0
      return
    }
    results = miniSearch.search(q, { combineWith: 'AND' }).slice(0, 20)
    activeIndex = 0
  }

  function getSnippet(content, terms) {
    if (!content || !terms?.length) return content?.slice(0, 120) ?? ''

    const lower = content.toLowerCase()
    let bestPos = -1

    for (const term of terms) {
      const pos = lower.indexOf(term.toLowerCase())
      if (pos !== -1) {
        bestPos = pos
        break
      }
    }

    if (bestPos === -1) return content.slice(0, 120)

    const start = Math.max(0, bestPos - 40)
    const end = Math.min(content.length, bestPos + 80)
    let snippet = content.slice(start, end)

    if (start > 0) snippet = `...${snippet}`
    if (end < content.length) snippet = `${snippet}...`

    return snippet
  }

  function highlightText(text, terms) {
    if (!terms?.length || !text) return text

    const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  function navigate(href) {
    close()
    window.location.href = href
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIndex = Math.min(activeIndex + 1, results.length - 1)
      scrollActiveIntoView()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIndex = Math.max(activeIndex - 1, 0)
      scrollActiveIntoView()
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      navigate(results[activeIndex].href)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  function scrollActiveIntoView() {
    tick().then(() => {
      const active = listEl?.querySelector('.search-result--active')
      active?.scrollIntoView({ block: 'nearest' })
    })
  }

  function handleToggleSearch(e) {
    if (show) close()
    else open()
  }

  function handleGlobalKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      if (show) close()
      else open()
    }
  }

  onMount(() => {
    document.addEventListener('svp:toggle-search', handleToggleSearch)
    document.addEventListener('keydown', handleGlobalKeydown)
  })

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('svp:toggle-search', handleToggleSearch)
      document.removeEventListener('keydown', handleGlobalKeydown)
    }
  })

  $effect(() => {
    search(query)
  })
</script>

{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="search-overlay" onkeydown={handleKeydown}>
    <div class="search-backdrop" onclick={close} role="none"></div>
    <div class="search-modal">
      <div class="search-header">
        <div class="search-icon">
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
        </div>
        <input
          bind:this={inputEl}
          bind:value={query}
          class="search-input"
          placeholder="Search docs..."
          type="text"
        />
        <button class="search-close" onclick={close}>
          <kbd>Esc</kbd>
        </button>
      </div>
      <div class="search-results" bind:this={listEl}>
        {#if results.length > 0}
          {#each results as result, i}
            <button
              class="search-result"
              class:search-result--active={i === activeIndex}
              onclick={() => navigate(result.href)}
              onmouseenter={() => {
                activeIndex = i
              }}
            >
              <div class="search-result-title">
                {@html highlightText(result.title, result.terms)}
              </div>
              <div class="search-result-snippet">
                {@html highlightText(
                  getSnippet(result.content, result.terms),
                  result.terms,
                )}
              </div>
            </button>
          {/each}
        {:else if query.trim()}
          <div class="search-no-results">
            No results found for "<strong>{query}</strong>"
          </div>
        {:else}
          <div class="search-hint">Type to search documentation</div>
        {/if}
      </div>
      <div class="search-footer">
        <span class="search-footer-key"><kbd>↑↓</kbd> Navigate</span>
        <span class="search-footer-key"><kbd>↵</kbd> Open</span>
        <span class="search-footer-key"><kbd>Esc</kbd> Close</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
  }

  .search-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .search-modal {
    position: relative;
    width: 90%;
    max-width: 600px;
    max-height: 70vh;
    background: var(--svp-bg, #fff);
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :global(html.dark) .search-modal {
    background: var(--svp-expansion-bg-darker, #262626);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .search-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    gap: 12px;
  }

  .search-icon {
    flex-shrink: 0;
    opacity: 0.5;
    display: flex;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    color: var(--svp-text, inherit);
  }

  .search-input::placeholder {
    opacity: 0.5;
  }

  .search-close {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .search-close kbd {
    display: inline-block;
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;
    border: 1px solid rgba(128, 128, 128, 0.3);
    background: rgba(128, 128, 128, 0.1);
    color: var(--svp-text, inherit);
  }

  .search-results {
    overflow-y: auto;
    max-height: calc(70vh - 120px);
    padding: 8px;
  }

  .search-result {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    color: var(--svp-text, inherit);
    font-family: inherit;
  }

  .search-result--active {
    background: rgba(251, 113, 133, 0.1);
  }

  :global(html.dark) .search-result--active {
    background: rgba(251, 113, 133, 0.15);
  }

  .search-result-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .search-result-snippet {
    font-size: 13px;
    opacity: 0.7;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .search-result :global(mark) {
    background: rgba(251, 113, 133, 0.3);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }

  .search-no-results,
  .search-hint {
    padding: 24px;
    text-align: center;
    opacity: 0.6;
    font-size: 14px;
  }

  .search-footer {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    border-top: 1px solid rgba(128, 128, 128, 0.2);
    font-size: 12px;
    opacity: 0.6;
  }

  .search-footer-key kbd {
    display: inline-block;
    padding: 1px 4px;
    font-size: 11px;
    border-radius: 3px;
    border: 1px solid rgba(128, 128, 128, 0.3);
    background: rgba(128, 128, 128, 0.1);
    margin-right: 4px;
    font-family: inherit;
  }
</style>
