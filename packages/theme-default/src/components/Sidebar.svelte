<script>
  import Logo from './Logo.svelte'
  import { page } from '$app/stores'

  
  export let sidebars = []

  const routeId = $page.route.id
</script>

<aside class="theme-default-sidebar">
  <div class="sidebar-logo">
    <Logo />
  </div>
  {#each sidebars as sidebarItem}
    {@const isActive = routeId.endsWith('/') ? sidebarItem.to === routeId : sidebarItem.to === `${routeId}/` }
    <a href={sidebarItem.to} class={`sidebar-item${isActive ? ' active' : ''}`}>
      {sidebarItem.fm.title}
    </a>
  {/each}
</aside>

<style>
  .theme-default-sidebar {
    --at-apply: fixed top-0 left-0 bottom-0 pr-6 pb-32 
      bg-light-5 dark:bg-zinc-9 z-999 xl:w-[400px]
      pl-40 box-border;
  }
  .sidebar-logo {
    --at-apply: h-[72px] flex items-center mb-8
      border-b-solid border-b border-light-8 dark:border-b-gray-7;
  }
  .sidebar-item {
    --at-apply: block leading-8;
  }
  .active {
    color: transparent;
    background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
    background-clip: text;
    -webkit-background-clip: text;
  }
</style>