<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { slide } from 'svelte/transition'
  import { navCollapsed } from './layout'
  import TocMenu from './icons/TocMenu.svelte'
  import TocClose from './icons/TocClose.svelte'
  import NavItem from './NavItem.svelte'
  import Logo from './Logo.svelte'
  import Expansion from './Expansion.svelte'

  const toggleNav = () => {
    $navCollapsed = !$navCollapsed
  }
</script>

<div class="nav-trigger" on:click={toggleNav} on:keypress={toggleNav}>
  {#if $navCollapsed}
    <TocMenu />
  {:else}
    <TocClose />
  {/if}
</div>

{#if !$navCollapsed}
  <div class="navbar-mobile" transition:slide>
    <Logo />
    {#each themeOptions.navbar as navItem}
      {#if navItem.items}
        <Expansion title={navItem.title} showIcon={false}>
          {#each navItem.items as subItem}
            <NavItem {...subItem} />
          {/each}
        </Expansion>
      {:else}
        <NavItem {...navItem} />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .nav-trigger {
    --at-apply: 'ml-4 text-6 flex items-center sm:display-none';
  }
  .navbar-mobile {
    --at-apply: 'fixed top-[56px] left-0 right-0 bg-white dark:bg-black z-900 shadow-lg pb-4 dark:shadow-gray-8';
  }
  :global(.navbar-mobile .nav-item) {
    --at-apply: 'leading-12 px-4';
  }
  :global(.navbar-mobile .c-expansion--title) {
    --at-apply: 'text-4 font-700';
  }
  :global(.navbar-mobile .c-expansion .nav-item) {
    --at-apply: 'indent-[1em]';
  }
</style>
