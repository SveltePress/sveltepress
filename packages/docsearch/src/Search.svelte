<script>
  import docsearch from '@docsearch/js'
  import { onMount } from 'svelte'
  import '@docsearch/css/dist/style.css'

  const { appId, apiKey, indexName, ...rest } = $props()

  function initDocsearch() {
    const isDark = document.documentElement.classList.contains('dark')
    docsearch({
      container: '#docsearch',
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

<div id="docsearch" class="ml-4"></div>
