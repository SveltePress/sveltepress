<script >
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Toc from './Toc.svelte'
  import Home from './Home.svelte'
  import Sidebar from './Sidebar.svelte'
  import PageSwitcher from './PageSwitcher.svelte'
  import EditPage from './EditPage.svelte'
  import LastUpdate from './LastUpdate.svelte'
  import { page } from '$app/stores'

  const routeId = $page.route.id
  const isHome = routeId === '/'

  // The frontmatter info. This would be injected by sveltepress
  export let fm = {}

  export let siteConfig
  let resolvedSidebars = []

  const key = Object.keys(themeOptions.sidebar || {}).find(key => routeId.startsWith(key))
  if (key)
    resolvedSidebars = themeOptions.sidebar[key]
  
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
    <meta name="description" content="${description || siteConfig.description}">
</svelte:head>
  
{#if !isHome}
  <div pb-4 class="theme-default--page-layout">
    {#if sidebar === 'auto'}
      <Sidebar sidebar={resolvedSidebars} />
    {/if}
    <div class="content">
      {#if title}
        <h1>
          {title}
        </h1>
      {/if}
      <slot />
      <div class="flex justify-between">
        <EditPage {pageType} />
        <LastUpdate {lastUpdate} />
      </div>
      <PageSwitcher pages={resolvedSidebars} />
    </div>
    <Toc {anchors} />
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
    --at-apply: w-[50vw] mx-auto pb-28;
  }
</style>