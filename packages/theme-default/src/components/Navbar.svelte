<script lang="ts">
  import type { Component } from 'svelte'
  import { page } from '$app/state'
  import { onMount } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Discord from './icons/Discord.svelte'
  import Github from './icons/Github.svelte'
  import { scrollDirection } from './layout'
  import Logo from './Logo.svelte'
  import MobileSubNav from './MobileSubNav.svelte'
  import NavbarMobile from './NavbarMobile.svelte'
  import NavItem from './NavItem.svelte'
  import ToggleDark from './ToggleDark.svelte'

  const routeId = $derived(page.route.id)
  const isHome = $derived(routeId === '/')
  const hasError = $derived(page.error)

  let docsearchComponent = $state<Component | undefined>()
  let searchComponent = $state<Component | undefined>()

  onMount(async () => {
    // Load custom search component if it's a string path
    if (themeOptions.search && typeof themeOptions.search === 'string') {
      try {
        searchComponent = (await import(/* @vite-ignore */ themeOptions.search))
          .default
      } catch (e) {
        console.error(
          '[sveltepress] Failed to load custom search component:',
          e,
        )
      }
    }

    // Load docsearch if no custom search is provided
    if (themeOptions.docsearch && !themeOptions.search) {
      try {
        docsearchComponent = (
          await import('@sveltepress/docsearch/Search.svelte')
        ).default
      } catch (e) {
        console.error('[sveltepress] Failed to load docsearch component:', e)
      }
    }
  })
</script>

<header class="header" class:hidden-in-mobile={$scrollDirection === 'down'}>
  <div class="header-inner">
    <div class="left">
      <NavbarMobile />
      <div class="logo-container" class:desktop-visible={hasError || isHome}>
        <Logo />
      </div>
    </div>
    {#if searchComponent || (themeOptions.search && typeof themeOptions.search !== 'string')}
      <div
        class:is-home={isHome}
        class:move={!isHome && !hasError}
        class="doc-search"
      >
        <svelte:component this={searchComponent || themeOptions.search} />
      </div>
    {:else if themeOptions.docsearch && docsearchComponent}
      <div
        class:is-home={isHome}
        class:move={!isHome && !hasError}
        class="doc-search"
      >
        <svelte:component
          this={docsearchComponent}
          {...themeOptions.docsearch}
        />
      </div>
    {/if}

    <nav class="nav-links" aria-label="Menu">
      <div class="navbar-pc">
        <div class="sm:flex none">
          {#each themeOptions.navbar as navItem}
            <NavItem {...navItem} />
          {/each}
        </div>
        {#if themeOptions.github}
          <NavItem
            to={themeOptions.github}
            external
            icon
            builtInIcon
            title="Github"
          >
            <Github />
          </NavItem>
        {/if}

        {#if themeOptions.discord}
          <NavItem
            to={themeOptions.discord}
            external
            icon
            builtInIcon
            title="Discord"
          >
            <Discord />
          </NavItem>
        {/if}
        <ToggleDark />
      </div>
    </nav>
  </div>
  {#if !isHome}
    <MobileSubNav />
  {/if}
</header>

<style>
  .header {
    --at-apply: 'transition-transform fixed top-0 left-0 right-0 sm:h-[73px] z-888 bg-[rgba(246,246,247,0.85)] dark:bg-[rgba(24,24,27,0.8)] b-b-1 b-b-solid b-b-black/5 dark:b-b-white/8';
    backdrop-filter: blur(12px) saturate(1.8);
    -webkit-backdrop-filter: blur(12px) saturate(1.8);
  }
  .hidden-in-mobile {
    --at-apply: 'translate-y-[-100%] sm:translate-y-0';
  }
  /* Mobile always shows the brand mark (wordmark hidden to save space);
     desktop shows the full logo only on home/error, elsewhere it lives in
     the sidebar. */
  .logo-container {
    --at-apply: 'block';
  }
  .logo-container:not(.desktop-visible) {
    --at-apply: 'sm:hidden';
  }
  .logo-container :global(.title) {
    --at-apply: 'hidden sm:inline';
  }
  .header-inner {
    --at-apply: 'sm:max-w-[1440px] box-border sm:px-6 h-full flex items-stretch justify-between mx-auto';
  }
  .left {
    --at-apply: 'flex items-center';
  }
  .doc-search {
    --at-apply: 'flex-grow flex items-center relative transition-500 transition-left';
  }
  .doc-search.is-home {
    --at-apply: 'left-2';
  }
  /* On docs pages the sidebar panel (incl. its logo row) paints over the
     header's left zone, so the pill starts just right of the sidebar edge —
     i.e. aligned with the content area. */
  .doc-search.move {
    --at-apply: 'sm:left-[calc(min(25vw,288px)-8px)]';
  }

  .navbar-pc {
    --at-apply: 'items-stretch flex';
  }
  .nav-links {
    --at-apply: 'flex items-stretch flex-grow justify-end';
  }

  .navbar-pc :global(.nav-item:not(.nav-item--icon)),
  .navbar-pc :global(.nav-item--user-icon) {
    --at-apply: 'hidden sm:flex';
  }
</style>
