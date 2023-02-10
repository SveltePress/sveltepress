<script>
  import { scrollY, sidebarCollapsed, tocCollapsed } from './layout'
  import More from './icons/More.svelte'
  import ActionLeft from './icons/ActionLeft.svelte'
  import ActionRight from './icons/ActionRight.svelte'
  import Up from './icons/Up.svelte'
  import { page } from '$app/stores'

  $: routeId = $page.route.id
  $: isHome = routeId === '/'

  let expanded = false

  const handleToggleExpand = () => {
    expanded = !expanded
  }

  const toggleToc = () => {
    $tocCollapsed = !$tocCollapsed
  }

  const toggleSidebar = () => {
    $sidebarCollapsed = !$sidebarCollapsed
  }

  const scrollToTop = () => {
    $scrollY = 0
  }
</script>

{#if !isHome}
  <div
    class="float-actions-trigger"
    class:expanded
    on:click={handleToggleExpand}
    on:keypress={handleToggleExpand}
  >
    <More />
  </div>
{/if}

<div
  class="sidebar-trigger"
  class:expanded
  on:click={toggleToc}
  on:keypress={toggleToc}
>
  <ActionRight />
</div>

<div
  class="toc-trigger"
  class:expanded
  on:click={toggleSidebar}
  on:keypress={toggleSidebar}
>
  <ActionLeft />
</div>

<div
  class="back-to-top-trigger"
  class:expanded
  on:click={scrollToTop}
  on:keypress={scrollToTop}
>
  <Up />
</div>

<style>
  .float-actions-trigger,
  .sidebar-trigger,
  .back-to-top-trigger,
  .toc-trigger {
    --at-apply: 'sm:display-none fixed bottom-[12px] right-[12px] w-[42px] h-[42px] bg-white dark:shadow-gray-5 dark:bg-gray-9 rounded-[50%] shadow-md flex items-center justify-center text-6 transition-transform transition-300 z-[989]';
  }
  .float-actions-trigger {
    --at-apply: 'z-990';
  }
  .back-to-top-trigger.expanded {
    transform: translateX(calc(-100% - 12px));
  }
  .toc-trigger.expanded {
    transform: translate(calc(-100% - 8px), calc(-100% - 8px));
  }
  .sidebar-trigger.expanded {
    transform: translateY(calc(-100% - 12px));
  }
  .float-actions-trigger.expanded {
    --at-apply: 'rotate-90';
  }
</style>
