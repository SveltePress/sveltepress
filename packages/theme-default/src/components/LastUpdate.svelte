<script>
  export let lastUpdate = ''
</script>

{#if lastUpdate}
  <div text-gray-4>
    Last update at: {lastUpdate}
  </div>
{/if}