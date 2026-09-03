<script>
  import { page } from '$app/state'
  import { resolveLocaleOptions } from './locale'

  /**
   * @typedef {object} Props
   * @property {string} [lastUpdate] - Last update time
   */

  /** @type {Props} */
  const { lastUpdate = '' } = $props()

  const DEFAULT_TEXT = 'Last update at:'
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
</script>

{#if lastUpdate}
  <div class="last-update">
    {localeOptions.i18n?.lastUpdateAt || DEFAULT_TEXT}
    {lastUpdate.replace(/:\d{2}$/, '')}
  </div>
{/if}

<style>
  .last-update {
    --at-apply: 'mt-4 sm:mt-0 text-zinc-5 dark:text-zinc-4 text-[14px]';
  }
</style>
