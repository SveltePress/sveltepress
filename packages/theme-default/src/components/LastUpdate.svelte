<script>
  export let lastUpdate = ''
</script>

{#if lastUpdate}
  <div text-gray-4 class="mt-4 sm:mt-0">
    Last update at: {lastUpdate}
  </div>
{/if}