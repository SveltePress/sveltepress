<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Logo from './Logo.svelte'
  import { page } from '$app/stores'
  
  const sidebar = themeOptions.sidebar
  const routeId = $page.route.id
  
  let resolvedSidebars = []

  Object.entries(sidebar).forEach(([key, val]) => {
    if (routeId.startsWith(key))
      resolvedSidebars = val
  })
</script>

{#if resolvedSidebars.length}
  <aside class="theme-default-sidebar">
    <div class="sidebar-logo">
      <Logo />
    </div>
    {#each resolvedSidebars as sidebarItem}
      {@const isActive = routeId.endsWith('/') ? sidebarItem.to === routeId : sidebarItem.to === `${routeId}/` }
      <a href={sidebarItem.to} class={`sidebar-item${isActive ? ' active' : ''}`}>
        {sidebarItem.title}
      </a>
    {/each}
  </aside>
{/if}

<style>
  .theme-default-sidebar {
    --at-apply: fixed top-0 left-0 bottom-0 pr-6 pb-32 
      bg-light-6 dark:bg-dark-9 z-999 xl:w-[400px]
      pl-40 box-border;
  }
  .sidebar-logo {
    --at-apply: h-[72px] flex items-center mb-4
      border-b-solid border-b border-light-8 dark:border-b-gray-7;
  }
  .sidebar-item {
    --at-apply: block leading-8 transition-text transition-color;
  }
  .sidebar-item:not(.active) {
    --at-apply: hover:text-rose-4;
  }
  .sidebar-item.active {
    cursor: default;
  }
  .active {
    color: transparent;
    background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
    background-clip: text;
    -webkit-background-clip: text;
  }
</style>