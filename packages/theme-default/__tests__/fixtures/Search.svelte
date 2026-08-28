<script lang="ts">
  let { version }: { version?: { id?: string } | null } = $props()
</script>

<div data-testid="search">search:{version?.id ?? 'current'}</div>
