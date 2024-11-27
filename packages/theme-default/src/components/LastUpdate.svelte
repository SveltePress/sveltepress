<script>
  import themeOptions from 'virtual:sveltepress/theme-default'

  /**
   * @typedef {object} Props
   * @property {string} [lastUpdate] - Last update time
   */

  /** @type {Props} */
  const { lastUpdate = '' } = $props()

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
