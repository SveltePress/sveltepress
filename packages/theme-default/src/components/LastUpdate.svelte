<script>
  export let lastUpdate = ''
</script>

{#if lastUpdate}
  <div class="last-update">
    Last update at: {lastUpdate}
  </div>
{/if}

<style>
  .last-update {
    --at-apply: mt-4 sm:mt-0 text-gray-5 dark:text-gray-4 text-[14px];
  }
</style>
