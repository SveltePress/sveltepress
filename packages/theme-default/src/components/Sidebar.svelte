<script>
  import Logo from './Logo.svelte'
  import SidebarItem from './SidebarItem.svelte'
  import SidebarGroup from './SidebarGroup.svelte'
  import { sidebarCollapsed } from './layout'
  import Close from './icons/Close.svelte'

  export let sidebar = []

  const handleCloseClick = () => {
    $sidebarCollapsed = true
  }
</script>

{#if sidebar.length}
  <aside class="theme-default-sidebar" class:collapsed={$sidebarCollapsed}>
    <div class="sidebar-logo">
      <Logo />
      <div class="close" on:click={handleCloseClick} on:keyup={handleCloseClick}>
        <Close />
      </div>
    </div>
    {#each sidebar as sidebarItem}
      <svelte:component this={Array.isArray(sidebarItem.items) ? SidebarGroup : SidebarItem} {...sidebarItem} />
    {/each}
  </aside>
{/if}

<style>
  .theme-default-sidebar {
    --at-apply: fixed top-0 left-0 bottom-0 pr-6 pb-32 
      bg-light-6 dark:bg-dark-9 z-99 
      sm:w-[25vw] w-[60vw] pl-4 sm:pl-[10vw] box-border
      transition-transform transition-300 shadow-md sm:shadow-none;
  }
  .sidebar-logo {
    --at-apply: h-[72px] flex items-center mb-4 justify-between
      border-b-solid border-b border-light-8 dark:border-b-gray-7;
  }
  .collapsed {
    --at-apply: -translate-x-100;
  }
  .close {
    --at-apply: text-7 flex items-center sm:display:none;
  }
</style>