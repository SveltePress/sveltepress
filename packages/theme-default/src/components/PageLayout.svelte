<script >
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Home from './Home.svelte'
  import Sidebar from './Sidebar.svelte'
  import PageSwitcher from './PageSwitcher.svelte'
  import EditPage from './EditPage.svelte'
  import LastUpdate from './LastUpdate.svelte'
  import { anchors } from './layout'
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
    anchors: fmAnchors = []
  } = fm

  anchors.set(fmAnchors)

</script>
<svelte:head>
  <title>{title ? `${title} - ${siteConfig.title}` : siteConfig.title}</title>
  <meta name="description" content={description || siteConfig.description}>
</svelte:head>
  
{#if sidebar === 'auto'}
  <Sidebar sidebar={resolvedSidebars} />
{/if}

{#if !isHome}
  <div pb-4 class="theme-default--page-layout">
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
  </div>
{:else}
  <Home {...fm} {siteConfig} />
  <slot />
{/if}

<style>
  :global(.theme-default--page-layout h2) {
    --at-apply: border-t-solid border-t 
      border-light-7 dark:border-gray-7 pt-4 mt-8 mb-4;
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