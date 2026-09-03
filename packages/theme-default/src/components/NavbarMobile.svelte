<script>
  import { page } from '$app/state'
  import { slide } from 'svelte/transition'
  import { locales } from 'virtual:sveltepress/locale'
  import LocaleSelector from 'virtual:sveltepress/theme-default/LocaleSelector.svelte'
  import VersionSelector from 'virtual:sveltepress/theme-default/VersionSelector.svelte'
  import Expansion from './Expansion.svelte'
  import TocClose from './icons/TocClose.svelte'
  import TocMenu from './icons/TocMenu.svelte'
  import { navCollapsed, sidebar } from './layout'
  import { resolveLocaleOptions } from './locale'
  import Logo from './Logo.svelte'
  import NavItem from './NavItem.svelte'

  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))

  function toggleNav() {
    $navCollapsed = !$navCollapsed
  }
</script>

<button
  type="button"
  class="nav-trigger"
  onclick={toggleNav}
  aria-label={localeOptions.i18n?.navbarMenu ?? 'Toggle navigation menu'}
  aria-expanded={!$navCollapsed}
  aria-controls="sveltepress-mobile-navigation"
>
  {#if $navCollapsed}
    <TocMenu />
  {:else}
    <TocClose />
  {/if}
</button>

{#if !$navCollapsed}
  <nav
    id="sveltepress-mobile-navigation"
    class="navbar-mobile"
    class:has-sidebar={$sidebar}
    transition:slide
    aria-label="Menu"
  >
    <Logo />
    {#if locales}
      <LocaleSelector mobile />
    {/if}
    <VersionSelector mobile />
    {#each localeOptions.navbar as navItem}
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
    --at-apply: 'text-6 text-inherit flex items-center justify-center w-8 h-10 flex-none p-0 b-0 bg-transparent cursor-pointer';
  }
  .navbar-mobile {
    --at-apply: 'fixed top-14 left-0 right-0 max-h-[calc(100vh-56px)] overflow-y-auto bg-white dark:bg-[#1c1c1f] z-900 shadow-lg pb-4 b-b-1 b-b-solid b-b-black/5 dark:b-b-white/8';
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

  @media (min-width: 950px) and (max-width: 1439px) {
    .navbar-mobile {
      top: 73px;
      max-height: calc(100vh - 73px);
    }
    .navbar-mobile.has-sidebar {
      left: calc(max(0px, (100vw - 1440px) / 2) + min(25vw, 288px));
    }
  }

  @media (min-width: 1440px) {
    .nav-trigger,
    .navbar-mobile {
      display: none;
    }
  }
</style>
