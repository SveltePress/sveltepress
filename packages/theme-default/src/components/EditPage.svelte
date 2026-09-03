<script>
  import { page } from '$app/state'
  import { resolveHistoricalEditLink } from 'virtual:sveltepress/theme-default/versioning'
  import { resolveVersionManifest } from 'virtual:sveltepress/versions'
  import Edit from './icons/Edit.svelte'
  import { resolveLocaleOptions } from './locale'

  const routeId = $derived(page.route.id)

  /**
   * @typedef {object} Props
   * @property {'md' | 'svelte'} [pageType] - The type of the page
   */

  /** @type {Props} */
  const { pageType = 'md' } = $props()

  const DEFAULT_TEXT = 'Suggest changes to this page'
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const resolvedEditLink = $derived(
    resolveHistoricalEditLink(
      localeOptions.editLink,
      routeId,
      pageType,
      resolveVersionManifest(page.url.pathname),
    ),
  )

  function handleEditLinkClick() {
    if (resolvedEditLink) window.open(resolvedEditLink, '_blank')
  }
</script>

{#if resolvedEditLink}
  <div
    class="edit-link"
    onclick={handleEditLinkClick}
    onkeyup={handleEditLinkClick}
    role="link"
    tabindex="0"
  >
    <div class="edit-icon">
      <Edit />
    </div>
    <div class="edit-text">
      {localeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT}
    </div>
  </div>
{/if}

<style>
  .edit-link {
    --at-apply: 'flex items-center text-svp-primary-deep dark:text-svp-primary hover:text-svp-hover cursor-pointer';
  }
  .edit-icon {
    --at-apply: 'text-5 flex items-center';
  }
  .edit-text {
    --at-apply: 'ml-1';
  }
</style>
