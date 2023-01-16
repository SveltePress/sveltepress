<script>
  import Logo from './Logo.svelte'
  import SidebarItem from './SidebarItem.svelte'
  import SidebarGroup from './SidebarGroup.svelte'
  import { sidebarCollapsed } from './layout'
  import themeConfig from 'virtual:sveltepress/theme-default'
  import Close from './icons/Close.svelte'
  import { page } from '$app/stores'

  const routeId = $page.route.id
  const isHome = routeId === '/'

  export let sidebar = []

  const handleClose = () => {
    $sidebarCollapsed = true
  }
</script>

<aside class="theme-default-sidebar" class:collapsed={$sidebarCollapsed}>
  <div class="close" on:click={handleClose} on:keyup={handleClose}>
    <Close />
  </div>
  <div class="sidebar-logo">
    <Logo />
    {#if !isHome}
      <div class="sidebar-mobile">
        {#each themeConfig.navbar as navbarItem}
          <svelte:component this={Array.isArray(navbarItem.items) ? SidebarGroup : SidebarItem} {...navbarItem} />
        {/each}
      </div>
    {/if}
  </div>

  {#if isHome}
    <div class="sidebar-mobile">
      {#each themeConfig.navbar as navbarItem}
        <svelte:component this={Array.isArray(navbarItem.items) ? SidebarGroup : SidebarItem} {...navbarItem} />
      {/each}
    </div>
  {/if}
    
  {#each sidebar as sidebarItem}
    <svelte:component this={Array.isArray(sidebarItem.items) ? SidebarGroup : SidebarItem} {...sidebarItem} />
  {/each}
</aside>

<style>
  .sidebar-mobile {
    --at-apply: sm:display-none mt-4;
  }
  .theme-default-sidebar {
    --at-apply: fixed top-0 left-0 bottom-0 pr-6 pb-32 
      bg-light-6 dark:bg-dark-9 z-99 
      sm:w-[25vw] w-[60vw] pl-4 sm:pl-[10vw] box-border
      transition-transform transition-300 shadow-md sm:shadow-none;
  }
  .sidebar-logo {
    --at-apply: sm:h-[72px] sm:flex sm:items-center mb-4 
      py-4 sm:py-0
      border-b-solid border-b border-light-8 dark:border-b-gray-7;
  }
  .collapsed {
    --at-apply: -translate-x-100 sm:translate-x-0;
  }
  .close {
    --at-apply: text-7 flex items-center sm:display-none
      absolute top-4 right-4 z-3;
  }
</style>