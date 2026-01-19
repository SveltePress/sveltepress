<script>
  import docsearch from '@docsearch/js'
  import { onMount } from 'svelte'
  import { darkMode } from './layout'

  const { appId, apiKey, indexName, ...rest } = $props()

  onMount(() => {
    const sub = darkMode.subscribe(v => {
      const isDark =
        v === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : v === 'dark'
      docsearch({
        container: '#docsearch',
        appId,
        apiKey,
        indexName,
        theme: isDark ? 'dark' : 'light',
        ...rest,
      })
    })
    return () => sub.unsubscribe()
  })
</script>

<div id="docsearch" class="ml-4"></div>
