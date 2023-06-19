<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { DEFAULT_ON_THIS_PAGE } from './Toc.svelte'
  import { sidebarCollapsed, tocCollapsed } from './layout'

  const openSidebar = () => {
    $sidebarCollapsed = false
  }

  const openToc = () => {
    $tocCollapsed = false
  }
</script>

<nav class="sub-nav">
  <div
    class="i-ic-round-menu-open text-6"
    on:click={openSidebar}
    on:keypress={openSidebar}
  />
  <div on:click={openToc} on:keypress={openToc}>
    {themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE}
  </div>
</nav>

<style>
  .sub-nav {
    --uno: 'flex items-center justify-between sm:display-none px-4 py-2 bg-white dark:bg-black';
  }
</style>
