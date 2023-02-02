<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Logo from './Logo.svelte'
  import SidebarGroup from './SidebarGroup.svelte'
  import { pages, sidebarCollapsed } from './layout'
  import Close from './icons/Close.svelte'
  import { page } from '$app/stores'

  $: routeId = $page.route.id
  $: isHome = routeId === '/'

  let resolvedSidebars = []

  const handleClose = () => {
    $sidebarCollapsed = true
  }

  const resolveSidebar = () => {
    const key = Object.keys(themeOptions.sidebar || {}).find(key =>
      routeId.startsWith(key)
    )
    if (key) resolvedSidebars = themeOptions.sidebar[key] || []
  }

  $: {
    routeId
    resolveSidebar()
  }

  const recomputedPages = () => {
    pages.set(
      resolvedSidebars.reduce(
        (allPages, item) =>
          Array.isArray(item.items)
            ? [...allPages, ...item.items]
            : [...allPages, item],
        []
      )
    )
  }

  $: {
    resolvedSidebars
    recomputedPages()
  }

  const allSidebars = Object.values(themeOptions.sidebar || []).reduce(
    (all, arr) => [...all, ...arr],
    []
  )
</script>

<aside
  class="theme-default-sidebar"
  class:collapsed={$sidebarCollapsed}
  class:is-home={isHome}
>
  <div class="sidebar-logo">
    <Logo />
    <div class="close" on:click={handleClose} on:keyup={handleClose}>
      <Close />
    </div>
  </div>

  <div class="sidebar-mobile">
    {#each allSidebars as sidebarItem}
      {@const hasItems = Array.isArray(sidebarItem.items)}
      <SidebarGroup
        {...hasItems ? sidebarItem : { title: '', items: [sidebarItem] }}
      />
    {/each}
  </div>

  <div class="sidebar-pc">
    {#each resolvedSidebars as sidebarItem}
      {@const hasItems = Array.isArray(sidebarItem.items)}
      <SidebarGroup
        {...hasItems ? sidebarItem : { title: '', items: [sidebarItem] }}
      />
    {/each}
  </div>
</aside>

<style>
  .sidebar-mobile {
    --at-apply: 'sm:display-none mt-4';
  }
  .sidebar-pc {
    --at-apply: 'display-none sm:display-block';
  }
  .is-home {
    --at-apply: 'sm:display-none';
  }
  .theme-default-sidebar {
    --at-apply: 'fixed top-0 left-0 bottom-0 pr-6 pb-4 sm:pb-32 overflow-y-auto bg-light-6 dark:bg-dark-9 z-999 sm:w-[25vw] w-[60vw] pl-4 sm:pl-[10vw] box-border transition-transform transition-300 shadow-md sm:shadow-none';
  }
  .sidebar-logo {
    --at-apply: 'sm:h-[72px] flex items-center mb-4 py-4 sm:py-0 sticky top-0 bg-inherit border-b-solid border-b border-light-8 dark:border-b-gray-7';
  }
  .collapsed {
    --at-apply: 'sm:translate-x-0';
    /* FIXME: This is likely a unocss and svelte-scoped bug */
    transform: translateX(-100%);
  }
  .close {
    --at-apply: 'text-5 flex items-center sm:display-none ml-4';
  }
</style>
