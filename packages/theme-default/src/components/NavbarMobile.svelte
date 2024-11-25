<script>
  import { slide } from 'svelte/transition'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Expansion from './Expansion.svelte'
  import TocClose from './icons/TocClose.svelte'
  import TocMenu from './icons/TocMenu.svelte'
  import { navCollapsed } from './layout'
  import Logo from './Logo.svelte'
  import NavItem from './NavItem.svelte'

  function toggleNav() {
    $navCollapsed = !$navCollapsed
  }
</script>

<div
  class="nav-trigger"
  onclick={toggleNav}
  onkeypress={toggleNav}
  role="menu"
  tabindex="0"
>
  {#if $navCollapsed}
    <TocMenu />
  {:else}
    <TocClose />
  {/if}
</div>

{#if !$navCollapsed}
  <nav class="navbar-mobile" transition:slide aria-label="Menu">
    <Logo />
    {#each themeOptions.navbar as navItem}
      {#if navItem.items}
        <Expansion title={navItem.title} showIcon={false}>
          {#snippet customTitle()}
            <div>
              {#if navItem.icon}
                <div class="text-6">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html navItem.icon}
                </div>
              {:else}
                {navItem.title}
              {/if}
            </div>
          {/snippet}
          {#each navItem.items as subItem}
            <NavItem {...subItem} />
          {/each}
        </Expansion>
      {:else}
        <NavItem {...navItem} />
      {/if}
    {/each}
  </nav>
{/if}

<style>
  .nav-trigger {
    --at-apply: 'ml-4 text-6 flex items-center sm:hidden';
  }
  .navbar-mobile {
    --at-apply: 'fixed top-[48px] left-0 right-0 bg-white dark:bg-black z-900 shadow-lg pb-4 dark:shadow-gray-8';
  }
  :global(.navbar-mobile .nav-item) {
    --at-apply: 'leading-12 px-4';
  }
  :global(.navbar-mobile .nav-item--icon) {
    --at-apply: 'h-12';
  }

  :global(.navbar-mobile .c-expansion--title) {
    --at-apply: 'text-4 font-700';
  }
  :global(.navbar-mobile .c-expansion .nav-item) {
    --at-apply: 'indent-[1em]';
  }
</style>
