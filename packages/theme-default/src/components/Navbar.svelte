<script lang="ts">
  import type { Component } from 'svelte'
  import { page } from '$app/state'
  import { locales } from 'virtual:sveltepress/locale'
  import LocaleSelector from 'virtual:sveltepress/theme-default/LocaleSelector.svelte'
  import { resolveVersionSearch } from 'virtual:sveltepress/theme-default/versioning'
  import VersionSelector from 'virtual:sveltepress/theme-default/VersionSelector.svelte'
  import {
    resolveVersionContext,
    resolveVersionManifest,
  } from 'virtual:sveltepress/versions'
  import Discord from './icons/Discord.svelte'
  import Github from './icons/Github.svelte'
  import { scrollDirection, sidebar } from './layout'
  import { resolveLocaleOptions, resolveLogicalRoute } from './locale'
  import Logo from './Logo.svelte'
  import MobileSubNav from './MobileSubNav.svelte'
  import NavbarMobile from './NavbarMobile.svelte'
  import NavItem from './NavItem.svelte'
  import LocalSearch from './search/LocalSearch.svelte'
  import ToggleDark from './ToggleDark.svelte'

  const routeId = $derived(page.route.id)
  const isHome = $derived(resolveLogicalRoute(routeId) === '/')
  const hasError = $derived(page.error)
  const versionContext = $derived(resolveVersionContext(page.url.pathname))
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const versionSearch = $derived(
    resolveVersionSearch(
      page.url.pathname,
      resolveVersionManifest(page.url.pathname),
    ),
  )
  const hasConfiguredSearch = $derived(localeOptions.search !== false)
  const versionedDocsearch = $derived.by(() => {
    if (!localeOptions.docsearch) return null
    const metadata = versionSearch.metadata
    if (!metadata) return localeOptions.docsearch
    const { facetFilters, ...overrides } = metadata
    return {
      ...localeOptions.docsearch,
      ...overrides,
      ...(facetFilters
        ? {
            searchParameters: {
              ...localeOptions.docsearch.searchParameters,
              facetFilters,
            },
          }
        : {}),
    }
  })

  let docsearchComponent = $state<Component | undefined>()
  let searchComponent = $state<Component | undefined>()

  async function loadSearch() {
    // Load custom search component if it's a string path
    if (
      versionSearch.available &&
      localeOptions.search &&
      typeof localeOptions.search === 'string'
    ) {
      try {
        searchComponent = (
          await import(/* @vite-ignore */ localeOptions.search)
        ).default
      } catch (e) {
        console.error(
          '[sveltepress] Failed to load custom search component:',
          e,
        )
      }
    }

    // Load docsearch if no custom search is provided
    if (
      versionSearch.available &&
      localeOptions.docsearch &&
      !localeOptions.search
    ) {
      try {
        docsearchComponent = (
          await import('@sveltepress/docsearch/Search.svelte')
        ).default
      } catch (e) {
        console.error('[sveltepress] Failed to load docsearch component:', e)
      }
    }
  }

  $effect(() => {
    if (versionSearch.available) void loadSearch()
  })
</script>

<header class="header" class:hidden-in-mobile={$scrollDirection === 'down'}>
  <div
    class="header-inner"
    class:has-sidebar={!isHome && !hasError && $sidebar}
  >
    <div class="left">
      <NavbarMobile />
      <div
        class="logo-container"
        class:desktop-visible={hasError || isHome || !$sidebar}
      >
        <Logo />
      </div>
    </div>
    {#if hasConfiguredSearch && !versionSearch.available}
      <div
        class:is-home={isHome || !$sidebar}
        class:move={!isHome && !hasError && $sidebar}
        class="doc-search search-unavailable"
        role="status"
      >
        {localeOptions.i18n?.versionSearchUnavailable ??
          'Search is not available for this documentation version.'}
      </div>
    {:else if searchComponent || (localeOptions.search && typeof localeOptions.search !== 'string')}
      <div
        class:is-home={isHome || !$sidebar}
        class:move={!isHome && !hasError && $sidebar}
        class="doc-search"
      >
        {#key versionContext?.versionId}
          {@const SearchComponent = searchComponent || localeOptions.search}
          <SearchComponent
            version={versionContext?.version}
            versionSearch={versionSearch.metadata}
          />
        {/key}
      </div>
    {:else if versionedDocsearch && docsearchComponent}
      <div
        class:is-home={isHome || !$sidebar}
        class:move={!isHome && !hasError && $sidebar}
        class="doc-search"
      >
        {#key `${versionContext?.versionId || ''}:${versionedDocsearch?.indexName || ''}`}
          {#if docsearchComponent}
            {@const DocsearchComponent = docsearchComponent}
            <DocsearchComponent {...versionedDocsearch} />
          {/if}
        {/key}
      </div>
    {:else if localeOptions.search !== false}
      <div
        class:is-home={isHome || !$sidebar}
        class:move={!isHome && !hasError && $sidebar}
        class="doc-search"
      >
        {#key versionContext?.versionId}
          <LocalSearch />
        {/key}
      </div>
    {/if}

    <nav class="nav-links" aria-label="Menu">
      <div class="navbar-pc">
        <div class="desktop-nav-items">
          {#each localeOptions.navbar as navItem}
            <NavItem {...navItem} />
          {/each}
        </div>
        {#if locales}<div class="desktop-locale-selector">
            <LocaleSelector />
          </div>{/if}
        {#if resolveVersionManifest(page.url.pathname)}<div
            class="desktop-version-selector"
          >
            <VersionSelector />
          </div>{/if}
        {#if localeOptions.github}
          <NavItem
            to={localeOptions.github}
            external
            icon
            builtInIcon
            title="Github"
          >
            <Github />
          </NavItem>
        {/if}

        {#if localeOptions.discord}
          <NavItem
            to={localeOptions.discord}
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
  /* The bar is opaque on purpose: a translucent bar let high-contrast content
     (big headings, code) read through as a ghost image while scrolling, and
     the colors here already match the page background, so translucency bought
     nothing but that artifact. */
  .header {
    --at-apply: 'transition-transform fixed top-0 left-0 right-0 sm:h-[73px] z-888 bg-[#f6f6f6] dark:bg-[#18181b] b-b-1 b-b-solid b-b-black/5 dark:b-b-white/8';
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
    display: block;
  }
  .logo-container :global(.title) {
    display: none;
  }
  .header-inner {
    --at-apply: 'sm:max-w-[1440px] box-border px-3 sm:px-4 xl:px-6 h-14 sm:h-full flex items-stretch justify-between gap-2 mx-auto';
  }
  .left {
    --at-apply: 'flex items-center gap-2 flex-none';
  }
  .doc-search {
    --at-apply: 'flex-grow min-w-0 flex items-center relative transition-300 ease-out';
  }
  .doc-search.is-home {
    --at-apply: 'left-0';
  }
  /* On docs pages the sidebar panel (incl. its logo row) paints over the
     header's left zone, so the pill starts just right of the sidebar edge —
     i.e. aligned with the content area. */
  .doc-search.move {
    --at-apply: 'left-0';
  }
  .search-unavailable {
    --at-apply: 'text-xs text-zinc-500 dark:text-zinc-400 px-3 flex-none max-w-32 sm:max-w-55 overflow-hidden text-ellipsis whitespace-nowrap';
  }

  .navbar-pc {
    --at-apply: 'items-stretch flex flex-none gap-1';
  }
  .nav-links {
    --at-apply: 'flex items-stretch flex-grow justify-end';
  }

  .desktop-nav-items,
  .desktop-locale-selector,
  .desktop-version-selector {
    display: none;
  }
  .navbar-pc :global(.nav-item--icon),
  .navbar-pc :global(.toggle) {
    padding-left: 0.55rem;
    padding-right: 0.55rem;
  }
  .navbar-pc :global(.nav-item--icon::after),
  .navbar-pc :global(.toggle::after) {
    display: none;
  }

  @media (min-width: 1440px) {
    .logo-container:not(.desktop-visible) {
      display: none;
    }
    .logo-container :global(.title) {
      display: inline;
    }
    .doc-search.move {
      margin-left: min(25vw, 288px);
    }
    .desktop-nav-items,
    .desktop-locale-selector,
    .desktop-version-selector {
      display: flex;
    }
    .navbar-pc :global(.nav-item--icon::after),
    .navbar-pc :global(.toggle::after) {
      display: block;
    }
  }

  @media (min-width: 950px) and (max-width: 1439px) {
    .header-inner.has-sidebar {
      padding-left: calc(min(25vw, 288px) + 1rem);
    }
    .header-inner.has-sidebar .logo-container {
      display: none;
    }
  }
</style>
