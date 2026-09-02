<script>
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import Backdrop from './Backdrop.svelte'
  import Close from './icons/Close.svelte'
  import { resolvedSidebar, resolveSidebar, sidebarCollapsed } from './layout'
  import { resolveLogicalRoute } from './locale'
  import Logo from './Logo.svelte'
  import SidebarGroup from './SidebarGroup.svelte'

  const routeId = $derived(page.route.id)
  const isHome = $derived(resolveLogicalRoute(routeId) === '/')

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
  /*
   * Bounded shell: the docs frame is capped at 1440px and centered. The
   * sidebar panel still paints from the viewport edge, but its content
   * column is pinned to the shell (min(25vw, 288px) wide) so ultrawide
   * screens gain whitespace instead of a wider sidebar.
   */
  .theme-default-sidebar {
    --at-apply: 'fixed top-0 left-0 bottom-0 pr-6 pb-4 sm:pb-32 overflow-y-auto bg-light-6 dark:bg-[#161618] z-999 w-[70vw] pl-4 box-border transition-transform transition-300 shadow-md sm:shadow-none b-r-1 b-r-solid b-r-black/5 dark:b-r-white/6 sm:w-[calc(max(0px,(100vw-1440px)/2)+min(25vw,288px))] sm:pl-[calc(max(0px,(100vw-1440px)/2)+24px)]';
  }
  .sidebar-logo {
    --at-apply: 'sm:h-[72px] flex items-center justify-between mb-4 py-4 sm:py-0 sticky top-0 bg-inherit border-b-solid border-b border-black/5 dark:border-b-white/8';
  }
  .collapsed {
    --at-apply: 'sm:translate-x-0';
    transform: translateX(-100%);
  }
  .close {
    --at-apply: 'text-5 flex items-center sm:hidden ml-4';
  }
</style>
