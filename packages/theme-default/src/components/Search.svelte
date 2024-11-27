<script>
  import docsearch from '@docsearch/js'
  import { onMount } from 'svelte'

  const { appId, apiKey, indexName, ...rest } = $props()

  onMount(() => {
    docsearch({
      container: '#docsearch',
      appId,
      apiKey,
      indexName,
      ...rest,
    })
  })
</script>

<div id="docsearch"></div>
