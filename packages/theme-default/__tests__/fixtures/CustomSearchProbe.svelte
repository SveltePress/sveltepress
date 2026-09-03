<script lang="ts">
  // Probe for the custom-search contract: Navbar passes the active version and
  // the per-version search metadata to custom search components.
  let {
    version,
    versionSearch,
  }: {
    version?: { id?: string } | null
    versionSearch?: { indexName?: string; facetFilters?: string[] } | null
  } = $props()
</script>

<div
  data-testid="custom-search"
  data-version={version?.id ?? ''}
  data-metadata={JSON.stringify(versionSearch ?? null)}
>custom:{version?.id ?? ''}</div>
