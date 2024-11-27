<script>
  import { page } from '$app/stores'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Edit from './icons/Edit.svelte'

  const routeId = $page.route.id

  /**
   * @typedef {object} Props
   * @property {'md' | 'svelte'} [pageType] - The type of the page
   */

  /** @type {Props} */
  const { pageType = 'md' } = $props()

  const DEFAULT_TEXT = 'Suggest changes to this page'

  function handleEditLinkClick() {
    if (themeOptions.editLink) {
      window.open(
        themeOptions.editLink.replace(':route', `${routeId}/+page.${pageType}`),
        '_blank',
      )
    }
  }
</script>

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

<style>
  .edit-link {
    --at-apply: 'flex items-center text-svp-primary hover:text-svp-hover cursor-pointer';
  }
  .edit-icon {
    --at-apply: 'text-5 flex items-center';
  }
  .edit-text {
    --at-apply: 'ml-1';
  }
</style>
