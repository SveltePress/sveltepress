<script lang="ts">
  // Probe for the DocSearch widget: Navbar mounts this stub in place of the
  // dynamically imported `@sveltepress/docsearch/Search.svelte` and spreads the
  // resolved (locale- and version-merged) docsearch props onto it.
  let {
    indexName,
    appId,
    apiKey,
    searchParameters,
  }: {
    indexName?: string
    appId?: string
    apiKey?: string
    searchParameters?: { facetFilters?: string[] }
  } = $props()
</script>

<div
  data-testid="docsearch"
  data-index={indexName ?? ''}
  data-appid={appId ?? ''}
  data-apikey={apiKey ?? ''}
  data-facets={JSON.stringify(searchParameters?.facetFilters ?? null)}
>docsearch:{indexName ?? ''}</div>
