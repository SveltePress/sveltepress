<script>
  export let lastUpdate = ''
</script>

{#if lastUpdate}
  <div text-gray-4 class="mt-4 sm:mt-0 text-gray-5 text-[14px]">
    Last update at: {lastUpdate}
  </div>
{/if}