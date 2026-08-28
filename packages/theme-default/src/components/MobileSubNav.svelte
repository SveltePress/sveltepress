<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import MenuOpen from './icons/MenuOpen.svelte'
  import { anchors, sidebar, sidebarCollapsed, tocCollapsed } from './layout'
  import { DEFAULT_ON_THIS_PAGE } from './Toc.svelte'

  function openSidebar() {
    $sidebarCollapsed = false
  }

  function openToc() {
    $tocCollapsed = false
  }
</script>

{#if $sidebar || $anchors.length}
  <nav class="sub-nav" aria-label="Browse docs">
    {#if $sidebar}
      <div
        role="button"
        tabindex="0"
        class="text-6"
        onclick={openSidebar}
        onkeypress={openSidebar}
      >
        <MenuOpen />
      </div>
    {/if}
    {#if $anchors.length}
      <div role="button" tabindex="0" onclick={openToc} onkeypress={openToc}>
        {themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE}
      </div>
    {/if}
  </nav>
{/if}

<style>
  .sub-nav {
    --at-apply: 'flex items-center justify-between sm:hidden px-4 py-2';
  }
</style>
