<script>
  import Logo from './Logo.svelte'
  import { page } from '$app/stores'
  const routeId = $page.route.id

  export let sidebars = []

</script>

<aside class="theme-default-sidebar">
  <div class="sidebar-logo">
    <Logo />
  </div>
  {#each sidebars as sidebarItem}
    <a href={sidebarItem}>
      {sidebarItem}
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
</style>