<script>
  import { onMount } from 'svelte'
  import docsearch from '@docsearch/js'

  export let appId
  export let apiKey
  export let indexName

  onMount(() => {
    docsearch({
      container: '#docsearch',
      appId,
      apiKey,
      indexName
    })
  })
</script>

<div class="search" id="docsearch"></div>
