<script >
  import Toc from './Toc.svelte'
  import Home from './Home.svelte'
  import Sidebar from './Sidebar.svelte'
  import { page } from '$app/stores'
  import PageSwitcher from './PageSwitcher.svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import EditPage from './EditPage.svelte'

  const routeId = $page.route.id
  const isHome = routeId === '/'

  // The frontmatter info. This would be injected by sveltepress
  export let fm = {}

  export let siteConfig
  let resolvedSidebars = []

  const key = Object.keys(themeOptions.sidebar || {}).find((key) => routeId.startsWith(key))
  if(key) {
    resolvedSidebars = themeOptions.sidebar[key]
  }
  const {
    sidebar = 'auto',
    title,
    description,
    pageType
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
      <EditPage {pageType} />
      <PageSwitcher pages={resolvedSidebars} />
    </div>
    <Toc />
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
    --at-apply: xl:w-[860px] mx-auto;
  }
</style>