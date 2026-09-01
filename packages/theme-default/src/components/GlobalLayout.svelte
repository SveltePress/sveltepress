<script>
  import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { onMount, setContext, tick } from 'svelte'
  import { locales } from 'virtual:sveltepress/locale'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import LocaleFallbackNotice from 'virtual:sveltepress/theme-default/LocaleFallbackNotice.svelte'
  import VersionFallbackNotice from 'virtual:sveltepress/theme-default/VersionFallbackNotice.svelte'
  import VersionLifecycleBanner from 'virtual:sveltepress/theme-default/VersionLifecycleBanner.svelte'
  import { manifest, resolveVersionContext } from 'virtual:sveltepress/versions'
  import { SVELTEPRESS_CONTEXT_KEY } from '../context'
  import AjaxBar from './AjaxBar.svelte'
  import Backdrop from './Backdrop.svelte'
  import Error from './Error.svelte'
  import GoogleAnalytics from './GoogleAnalytics.svelte'
  import {
    anchors,
    isDark,
    navCollapsed,
    oldScrollY,
    resolveSidebar,
    scrollY,
    showHeader,
    showLayout,
    sidebar,
    sidebarCollapsed,
  } from './layout'
  import Navbar from './Navbar.svelte'
  import Sidebar from './Sidebar.svelte'
  import Toc from './Toc.svelte'
  import { updateVersionChangeBadges } from './version-change-badges'
  import 'virtual:uno.css'
  import '../style.css'
  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] The content of the page
   */

  /** @type {Props & { [key: string]: any }} */
  const { children, ...rest } = $props()

  setContext(SVELTEPRESS_CONTEXT_KEY, {
    isDark,
  })

  resolveSidebar(page.route.id)

  function refreshVersionChangeBadges() {
    const context = resolveVersionContext(page.url.pathname)
    updateVersionChangeBadges(document, context?.version)
  }

  let ajaxBar = $state()

  beforeNavigate(() => {
    ajaxBar?.start()
  })

  afterNavigate(() => {
    ajaxBar?.end()
    resolveSidebar(page.route.id)
    $sidebarCollapsed = true
    $navCollapsed = true
    tick().then(refreshVersionChangeBadges)
  })

  // Cross-page view transition: the brand logo and the search pill morph
  // smoothly between their home/docs positions (see the `svp-nav-vt` rules
  // in style.css). The page itself still swaps instantly.
  onNavigate(navigation => {
    if (!document.startViewTransition) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    return new Promise(resolve => {
      document.documentElement.classList.add('svp-nav-vt')
      const transition = document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
      transition.finished.finally(() => {
        document.documentElement.classList.remove('svp-nav-vt')
      })
    })
  })

  let pwaComponent = $state()

  // Delegated handler for the "Expand code" bar on collapsed long code
  // blocks — the bar is emitted by the markdown pipeline as plain HTML.
  function handleCodeExpand(e) {
    if (e.type === 'keyup' && e.key !== 'Enter') return
    const trigger = e.target?.closest?.('.svp-code-block--expand')
    if (trigger) {
      const wrapper = trigger.closest('.svp-code-block-wrapper')
      wrapper?.classList.remove('svp-code-block-wrapper--collapsed')
    }
  }

  onMount(async () => {
    refreshVersionChangeBadges()
    if (themeOptions.pwa)
      pwaComponent = (await import('./pwa/Pwa.svelte')).default
  })

  // eslint-disable-next-line no-unused-expressions
  rest
</script>

<svelte:window
  onscroll={() => ($oldScrollY = $scrollY)}
  bind:scrollY={$scrollY}
  onclick={handleCodeExpand}
  onkeyup={handleCodeExpand}
/>

{#if manifest}
  <VersionLifecycleBanner />
{/if}
{#if $showHeader}
  <Navbar />
{/if}
{#if page.error}
  <Error error={page.error} />
{:else if $showLayout === false}
  {@render children?.()}
{:else}
  <main
    class:without-header={$showHeader === false}
    class:with-mobile-subnav={$sidebar || $anchors.length}
  >
    <AjaxBar bind:this={ajaxBar} />
    {#if locales}
      <LocaleFallbackNotice />
    {/if}
    {#if manifest}
      <VersionFallbackNotice />
    {/if}
    {#if $sidebar}
      <Sidebar />
    {/if}
    <Backdrop
      show={!$navCollapsed}
      on:close={() => ($navCollapsed = true)}
      top="56px"
      zIndex={887}
    />
    {@render children?.()}

    <Toc anchors={$anchors} />

    <GoogleAnalytics />

    {#if pwaComponent}
      {@const SvelteComponent = pwaComponent}
      <SvelteComponent />
    {/if}
  </main>
{/if}

<style>
  main {
    --at-apply: 'pt-14 sm:pt-[73px]';
  }
  main.with-mobile-subnav {
    --at-apply: 'pt-[100px] sm:pt-[73px]';
  }
  main.without-header {
    --at-apply: 'pt-0';
  }
  :global(html) {
    --at-apply: 'scroll-smooth';
    color-scheme: light;
    overflow-x: clip;
    /* reserve the scrollbar gutter on every page so fixed/centered chrome
       (navbar, search pill) doesn't shift between scrollable and short pages */
    scrollbar-gutter: stable;
  }
  :global(body) {
    /* clip (not hidden): full-bleed vw-sized blocks overflow by the classic
       scrollbar width; clip removes the wiggle without breaking sticky */
    overflow-x: clip;
    --at-apply: 'bg-light-4 dark:bg-zinc-9 text-zinc-7 dark:text-zinc-3 scroll-smooth';
    font-family:
      'Inter var experimental',
      'Inter var',
      'Inter',
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      'Helvetica Neue',
      Helvetica,
      Arial,
      'Noto Sans',
      sans-serif,
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      'Noto Color Emoji';
  }
  :global(a) {
    --at-apply: 'text-inherit decoration-none';
  }
  :global(sup a) {
    --at-apply: 'c-svp-primary-deep dark:c-svp-primary';
  }
  :global(p) {
    --at-apply: 'leading-7';
  }

  :global(ul) {
    padding-left: 1.25rem;
    margin: 16px 0;
    line-height: 1.5em;
  }

  :global(li + li) {
    margin-top: 0.5rem;
  }
  :global(.dark) {
    color-scheme: dark;
  }
  /* Heading ink via a variable at zero specificity (:where), so any
     utility class — e.g. text-green on a demo heading — wins in BOTH
     modes. A `.dark h3 { color }` rule would outrank utility classes. */
  :global(:where(h1, h2, h3, h4, h5, h6)) {
    color: var(--svp-c-heading, #18181b);
  }
  :global(code) {
    --at-apply: 'bg-[#ececee] dark:bg-[#2e2e32] dark:text-zinc-3 text-zinc-7 px-[6px] py-[3px] rounded-md break-words text-[0.875em]';
  }
  :global(pre.shiki code) {
    --at-apply: 'bg-transparent dark:bg-transparent p-unset block text-[1em]';
  }

  :global(.svp-code-block-wrapper) {
    --svp-code-bg: #ffffff;
    --at-apply: 'bg-[var(--svp-code-bg)] sm:rounded-lg text-[14px] mb-8 mx-[-5vw] sm:mx-none b-1 b-solid b-black/8 dark:b-white/8';
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }
  :global(.dark .svp-code-block-wrapper) {
    --svp-code-bg: #1f1f23;
    box-shadow: none;
  }
  :global(.svp-code-block-wrapper--collapsed .svp-code-block) {
    max-height: 400px;
    overflow-y: hidden;
  }
  :global(.svp-code-block-wrapper--collapsed .svp-code-block::after) {
    content: ' ';
    --at-apply: 'absolute left-0 right-0 bottom-0 h-20 pointer-events-none z-5';
    background: linear-gradient(transparent, var(--svp-code-bg));
  }
  :global(.svp-code-block--expand) {
    --at-apply: 'text-center text-[12px] leading-8 cursor-pointer text-zinc-5 dark:text-zinc-4 b-t-1 b-t-solid b-t-black/5 dark:b-t-white/6 hover:text-svp-primary-deep dark:hover:text-svp-primary transition-colors transition-150 select-none';
  }
  :global(
    .svp-code-block-wrapper:not(.svp-code-block-wrapper--collapsed)
      .svp-code-block--expand
  ) {
    --at-apply: 'hidden';
  }
  :global(.svp-live-code--container) {
    --at-apply: 'mx-[-5vw] sm:mx-none';
  }
  :global(.svp-live-code--container .svp-code-block-wrapper) {
    --at-apply: 'mx-none mb-none rounded-b-0 b-t-0 b-x-0 b-b-1 b-b-solid b-b-black/6 dark:b-b-white/8';
  }
  :global(.svp-live-code--container .c-expansion .svp-code-block-wrapper) {
    --at-apply: 'rounded-0 b-none';
  }
  :global(.svp-code-block) {
    --at-apply: 'relative px-[18px] py-[12px] overflow-auto';
  }
  :global(.svp-code-block--title) {
    --at-apply: 'px-[18px] leading-10 font-600 text-[13px] b-b b-b-solid b-b-black/6 dark:b-b-white/8';
  }
  :global(.svp-code-block--with-line-numbers) {
    --at-apply: 'pl-10';
  }
  :global(.svp-code-block--line-numbers) {
    --at-apply: 'absolute left-0 top-0 bottom-0 py-inherit text-3 text-right text-zinc-4 dark:text-zinc-6 px-2 leading-[21px] b-r-solid b-r b-r-black/5 dark:b-r-white/6';
    font-family: var(--svp-code-font);
  }
  :global(.svp-code-block:hover .svp-code-block--lang) {
    --at-apply: 'opacity-0';
  }
  :global(.c-expansion--body .svp-code-block) {
    --at-apply: 'rounded-none';
  }
  :global(.svp-live-code--container .c-expansion--title) {
    --at-apply: 'text-[13px] text-zinc-5 dark:text-zinc-4';
  }
  :global(.c-expansion--body .svp-code-block-wrapper) {
    --at-apply: 'mb-none';
  }
  :global(.svp-code-block--lang) {
    --at-apply: 'absolute top-[7px] right-3 z-100 text-zinc-5 dark:text-zinc-4 text-[11px] leading-none font-500 uppercase tracking-[0.06em] px-1.5 py-1 rounded bg-black/4 dark:bg-white/8 transition-300 transition-opacity';
  }
  :global(.svp-code-block--command-line) {
    --at-apply: 'absolute left-0 right-0 z-4 h-[1.5em] pointer-events-none';
  }
  :global(.svp-code-block--focus) {
    --at-apply: 'bg-white dark:bg-black pointer-events-none bg-opacity-20 dark:bg-opacity-20 absolute left-0 right-0 z-4 transition-300 transition-opacity';
    backdrop-filter: blur(1.5px);
  }
  :global(.svp-code-block--diff-bg-add) {
    --at-apply: 'bg-emerald-5 bg-opacity-12 dark:bg-emerald-4 dark:bg-opacity-14';
  }
  :global(.svp-code-block--diff-bg-sub) {
    --at-apply: 'bg-rose-5 bg-opacity-12 dark:bg-rose-4 dark:bg-opacity-14';
  }
  :global(.svp-code-block--with-line-numbers .svp-code-block--diff-add),
  :global(.svp-code-block--with-line-numbers .svp-code-block--diff-sub) {
    --at-apply: 'pl-8';
  }
  :global(.svp-code-block--diff-add) {
    --at-apply: 'text-emerald-6 dark:text-emerald-4';
  }
  :global(.svp-code-block--diff-sub) {
    --at-apply: 'text-rose-6 dark:text-rose-4';
  }
  :global(.svp-code-block--diff-add),
  :global(.svp-code-block--diff-sub) {
    --at-apply: 'absolute left-[4px] top-0 bottom-0 leading-[1.5em]';
    font-family: var(--svp-code-font);
  }
  :global(.svp-code-block--hl) {
    --at-apply: 'bg-black dark:bg-white bg-opacity-6 dark:bg-opacity-7';
  }
  :global(.svp-code-block:hover .svp-code-block--focus) {
    --at-apply: 'opacity-0';
  }
  :global(blockquote) {
    --at-apply: 'border-l-[3px] border-l-solid border-l-gray-3 dark:border-l-zinc-6 m-none pl-4 py-1 my-5 text-gray-6 dark:text-zinc-4';
  }
  :global(blockquote p) {
    --at-apply: 'm-none';
  }

  :global(table) {
    --at-apply: 'border-collapse w-full my-6';
  }
  :global(table th) {
    --at-apply: 'text-left px-3 py-2 font-600 border-b-2 border-b-solid border-black/10 dark:border-white/12';
  }
  :global(table tbody tr) {
    --at-apply: 'border-t-1 border-t-solid border-black/6 dark:border-white/8';
  }
  :global(table tbody tr:hover) {
    --at-apply: 'bg-black/4 dark:bg-white/5';
  }
  :global(table tbody tr td) {
    --at-apply: 'px-3 py-2';
  }
  :global(.svp-anchor-item) {
    --at-apply: 'relative bottom-[100px]';
  }
  :global(.svp-live-code--demo .svp-code-block-wrapper) {
    --at-apply: 'mb-0';
  }
</style>
