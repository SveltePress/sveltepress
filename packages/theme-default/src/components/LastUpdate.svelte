<script>
  import themeOptions from 'virtual:sveltepress/theme-default'

  export let lastUpdate = ''

  const DEFAULT_TEXT = 'Last update at:'
</script>

{#if lastUpdate}
  <div class="last-update">
    {themeOptions.i18n?.lastUpdateAt || DEFAULT_TEXT}
    {lastUpdate}
  </div>
{/if}

<style>
  .last-update {
    --at-apply: 'mt-4 sm:mt-0 text-gray-5 dark:text-gray-4 text-[14px]';
  }
</style>
