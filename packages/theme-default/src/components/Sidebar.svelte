<script>
  import Logo from './Logo.svelte'
  import SidebarItem from './SidebarItem.svelte'
  import SidebarGroup from './SidebarGroup.svelte'

  export let sidebar = []
</script>

{#if sidebar.length}
  <aside class="theme-default-sidebar">
    <div class="sidebar-logo">
      <Logo />
    </div>
    {#each sidebar as sidebarItem}
      <svelte:component this={Array.isArray(sidebarItem.items) ? SidebarGroup : SidebarItem} {...sidebarItem} />
    {/each}
  </aside>
{/if}

<style>
  .theme-default-sidebar {
    --at-apply: fixed top-0 left-0 bottom-0 pr-6 pb-32 
      bg-light-6 dark:bg-dark-9 z-99 w-[25vw] pl-[10vw] box-border;
  }
  .sidebar-logo {
    --at-apply: h-[72px] flex items-center mb-4
      border-b-solid border-b border-light-8 dark:border-b-gray-7;
  }
  
</style>