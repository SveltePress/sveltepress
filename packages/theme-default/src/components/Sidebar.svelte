<script>
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/stores'
  import Backdrop from './Backdrop.svelte'
  import Close from './icons/Close.svelte'
  import { resolvedSidebar, resolveSidebar, sidebarCollapsed } from './layout'
  import Logo from './Logo.svelte'
  import SidebarGroup from './SidebarGroup.svelte'

  const routeId = $derived($page.route.id)
  const isHome = $derived(routeId === '/')

  afterNavigate(() => {
    resolveSidebar(routeId)
  })

  function handleClose() {
    $sidebarCollapsed = true
  }
</script>

<aside
  class="theme-default-sidebar"
  class:collapsed={$sidebarCollapsed}
  class:is-home={isHome}
>
  <div class="sidebar-logo">
    <Logo />
    <div
      class="close"
      onclick={handleClose}
      onkeyup={handleClose}
      role="button"
      tabindex="0"
    >
      <Close />
    </div>
  </div>

  {#each $resolvedSidebar as sidebarItem}
    {@const hasItems = Array.isArray(sidebarItem.items)}
    <SidebarGroup
      {...hasItems ? sidebarItem : { title: '', items: [sidebarItem] }}
    />
  {/each}
</aside>

<Backdrop show={!$sidebarCollapsed} on:close={handleClose} />

<style>
  .is-home {
    --at-apply: 'sm:hidden';
  }
  .theme-default-sidebar {
    --at-apply: 'fixed top-0 left-0 bottom-0 pr-6 pb-4 sm:pb-32 overflow-y-auto bg-light-6 dark:bg-dark-9 z-999 sm:w-[25vw] w-[70vw] pl-4 sm:pl-[5vw] md:pl-[10vw] box-border transition-transform transition-300 shadow-md sm:shadow-none';
  }
  .sidebar-logo {
    --at-apply: 'sm:h-[72px] flex items-center justify-between mb-4 py-4 sm:py-0 sticky top-0 bg-inherit border-b-solid border-b border-light-8 dark:border-b-gray-7';
  }
  .collapsed {
    --at-apply: 'sm:translate-x-0';
    transform: translateX(-100%);
  }
  .close {
    --at-apply: 'text-5 flex items-center sm:hidden ml-4';
  }
</style>
