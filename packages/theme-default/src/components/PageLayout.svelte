<script >
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Toc from './Toc.svelte'
  import Home from './Home.svelte'
  import Sidebar from './Sidebar.svelte'
  import PageSwitcher from './PageSwitcher.svelte'
  import EditPage from './EditPage.svelte'
  import LastUpdate from './LastUpdate.svelte'
  import Navbar from './Navbar.svelte'
  import { page } from '$app/stores'

  const routeId = $page.route.id
  const isHome = routeId === '/'

  // The frontmatter info. This would be injected by sveltepress
  export let fm = {}

  export let siteConfig = {}

  let resolvedSidebars = []

  const key = Object.keys(themeOptions.sidebar || {}).find(key => routeId.startsWith(key))
  if (key)
    resolvedSidebars = themeOptions.sidebar[key] || []
  
  $: pages = resolvedSidebars.reduce((allPages, item) => Array.isArray(item.items)
    ? [
        ...allPages,
        ...item.items
      ]
    : [...allPages, item], [])

  const {
    sidebar = 'auto',
    title,
    description,
    pageType,
    lastUpdate,
    anchors = []
  } = fm

</script>
<svelte:head>
  <title>{title ? `${title} - ${siteConfig.title}` : siteConfig.title}</title>
  <meta name="description" content={description || siteConfig.description}>
</svelte:head>
  
<main>
  <Navbar />
  <div class="sidebar-mobile-home">
    <Sidebar />
  </div>
  
  {#if !isHome}
    <div pb-4 class="theme-default--page-layout">
      {#if sidebar === 'auto'}
        <Sidebar sidebar={resolvedSidebars} />
      {/if}
      <div class="content">
        {#if title}
          <h1 class="page-title">
            {title}
          </h1>
        {/if}
        <slot />
        <div class="meta">
          <EditPage {pageType} />
          <LastUpdate {lastUpdate} />
        </div>
        <PageSwitcher {pages} />
      </div>
      <Toc {anchors} />
    </div>
  {:else}
    <Home {...fm} {siteConfig} />
    <slot />
  {/if}
</main>

<style>
  :global(.theme-default--page-layout h2) {
    --at-apply: border-t-solid border-t 
      border-light-7 dark:border-gray-7 pt-4 mt-8 mb-4;
  }
  :global(body) {
    --at-apply: bg-light-4 dark:bg-zinc-9 text-[#213547] dark:text-warm-gray-2 scroll-smooth;
    font-family:  "Inter var experimental", "Inter var", "Inter", 
      ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
      "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, 
      "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", 
      "Segoe UI Symbol", "Noto Color Emoji";
	}
  :global(a) {
    --at-apply: text-[#213547] dark:text-[#efefef] decoration-none;
  }

  :global(p) {
    --at-apply: leading-6;
  }

  :global(ul) {
    padding-left: 1.25rem;
    margin: 16px 0;
    line-height: 2em;
  }

  :global(li+li) {
    margin-top: 0.5rem;
  }

  :global(html.dark ::-webkit-scrollbar) {
    width: 10px;
    height: 10px;
  }
  :global(html.dark ::-webkit-scrollbar-track) {
    --at-apply: bg-gray-8;
  }
  :global(html.dark ::-webkit-scrollbar-thumb) {
    --at-apply: bg-black;
    border-radius: 6px;
  }

  :global(code) {
    --at-apply: bg-[#e9e9e9] dark:bg-[#3a3a3a] dark:text-[#c9def1] text-[#476582] 
      px-[6px] py-[3px] rounded break-all;
  }
  :global(pre.shiki code) {
    --at-apply: bg-transparent dark:bg-transparent p-unset block;
  }

  :global(.svp-code-block) {
    --at-apply: relative bg-white dark:bg-[#011627] 
      transition-shadow transition-300 hover:shadow
      overflow-y-hidden py-[12px] px-18px rounded-lg text-[14px] mb-8;
  }
  :global(.svp-code-block:hover .svp-code-block--lang) {
    --at-apply: opacity-0;
  }
  :global(.c-expansion--body .svp-code-block) {
    --at-apply: rounded-none;
  }
  :global(.svp-code-block--lang) {
    --at-apply: absolute top-2 right-3 z-100 text-cool-gray-3 
      dark:text-cool-gray-7 text-[12px] transition-300 transition-opacity;
  }
  :global(.svp-code-block--command-line) {
    --at-apply: absolute left-0 right-0 z-2 h-[1.5em];
  }
  :global(.svp-code-block--focus) {
    --at-apply: bg-white dark:bg-black pointer-events-none 
      bg-opacity-20 dark:bg-opacity-20 absolute left-0 right-0 z-4
      transition-300 transition-opacity;
    backdrop-filter: blur(1.5px);
  }
  :global(.svp-code-block--diff-bg-add) {
    --at-apply: bg-green-4 bg-opacity-20 dark:bg-green-8 dark:bg-opacity-30; 
  }
  :global(.svp-code-block--diff-bg-sub) {
    --at-apply: bg-rose-4 bg-opacity-20 dark:bg-red-8 dark:bg-opacity-30;
  }
  :global(.svp-code-block--diff-add) {
    --at-apply: text-green-4;
  }
  :global(.svp-code-block--diff-sub) {
    --at-apply: text-rose-4;
  }
  :global(.svp-code-block--diff-add),
  :global(.svp-code-block--diff-sub) {
    --at-apply: absolute left-[4px] top-0 bottom-0 leading-[1.5em];
  }
  :global(.svp-code-block--hl) {
    --at-apply: bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-10;
  }
  :global(.svp-code-block:hover .svp-code-block--focus) {
    --at-apply: opacity-0;
  }
  :global(blockquote) {
    --at-apply: border-l-[4px] border-l-solid border-gray-4 m-none bg-gray-2
      indent-[1em] text-gray-4 py-[4px] my-4
      dark:border-l-gray-5 dark:bg-gray-8;
  }
  :global(blockquote p) {
    --at-apply: m-none;
  }
 
  :global(table) {
    --at-apply: border-collapse w-full;
  }
  :global(table th) {
    --at-apply: text-left p-2;
  }
  :global(table tbody tr) {
    --at-apply: border-t-1 border-t-solid border-gray-2 dark:border-gray-7;
  }
  :global(table tbody tr td) {
    --at-apply: p-2;
  }
  :global(.svp-anchor-item) {
    --at-apply: relative bottom-[74px];
  }
  main {
    --at-apply: pt-[56px] sm:pt-[73px];
  }
  .sidebar-mobile-home {
    --at-apply: sm:display-none;
  }
  .content {
    --at-apply: sm:w-[45vw] mx-auto pb-8 sm:pb-28 w-[90vw];
  }
  .page-title {
    --at-apply: mt-none;
  }
  .meta {
    --at-apply: sm:flex justify-between mt-20 column;
  }
 
</style>