<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { page } from '$app/stores'
  import Edit from './icons/Edit.svelte';
  const routeId = $page.route.id

  export let pageType = 'md'

  const handleEditLinkClick = () => {
    if(themeOptions.editLink) {
      window.open(themeOptions.editLink.replace(':route', `${routeId}/+page.${pageType}`), '_blank')
    }
  }
</script>

<div 
  class="edit-link"
  on:click={handleEditLinkClick}
  on:keyup={handleEditLinkClick}
>
  <Edit class="text-5" />
  <div ml-1>
    Edit this page on github 
  </div>
</div>

<style>
  .edit-link {
    --at-apply: flex items-center text-rose-4 hover:text-rose-6 cursor-pointer;
  }
</style>