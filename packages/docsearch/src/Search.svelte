<script lang="ts">
  import type { DocSearchProps } from '@docsearch/js'
  import docsearch from '@docsearch/js'
  import { onMount } from 'svelte'
  import '@docsearch/css/dist/style.css'

  const {
    appId,
    apiKey,
    indexName,
    ...rest
  }: Omit<DocSearchProps, 'container' | 'theme'> = $props()

  let containerEl = $state<HTMLDivElement | undefined>()
  let lastIsDark: boolean | undefined

  function initDocsearch() {
    if (!containerEl) return
    const isDark = document.documentElement.classList.contains('dark')
    if (isDark === lastIsDark && lastIsDark !== undefined) return
    lastIsDark = isDark
    containerEl.innerHTML = ''
    docsearch({
      container: containerEl,
      appId,
      apiKey,
      indexName,
      theme: isDark ? 'dark' : 'light',
      ...rest,
    })
  }

  onMount(() => {
    initDocsearch()

    const observer = new MutationObserver(() => {
      initDocsearch()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  })
</script>

<div bind:this={containerEl} class="ml-4"></div>
