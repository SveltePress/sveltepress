<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { DEFAULT_ON_THIS_PAGE } from './Toc.svelte'
  import { sidebarCollapsed, tocCollapsed } from './layout'

  function openSidebar() {
    $sidebarCollapsed = false
  }

  function openToc() {
    $tocCollapsed = false
  }
</script>

<nav class="sub-nav" aria-label="Browse docs">
  <div
    role="button"
    tabindex="0"
    class="i-ic-round-menu-open text-6"
    on:click={openSidebar}
    on:keypress={openSidebar}
  ></div>
  <div role="button" tabindex="0" on:click={openToc} on:keypress={openToc}>
    {themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE}
  </div>
</nav>

<style>
  .sub-nav {
    --uno: 'flex items-center justify-between sm:hidden px-4 py-2';
  }
</style>
