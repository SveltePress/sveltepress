<script>
  import { page } from '$app/state'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { resolveHistoricalEditLink } from 'virtual:sveltepress/theme-default/versioning'
  import { manifest } from 'virtual:sveltepress/versions'
  import Edit from './icons/Edit.svelte'

  const routeId = $derived(page.route.id)

  /**
   * @typedef {object} Props
   * @property {'md' | 'svelte'} [pageType] - The type of the page
   */

  /** @type {Props} */
  const { pageType = 'md' } = $props()

  const DEFAULT_TEXT = 'Suggest changes to this page'
  const resolvedEditLink = $derived(
    resolveHistoricalEditLink(
      themeOptions.editLink,
      routeId,
      pageType,
      manifest,
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
      {themeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT}
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
