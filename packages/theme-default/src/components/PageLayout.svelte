<script >
  import Toc from './Toc.svelte'
  import Home from './Home.svelte'
  import Sidebar from './Sidebar.svelte'
  import { page } from '$app/stores'

  const routeId = $page.route.id
  const isHome = routeId === '/'

  // The frontmatter info. This would be injected by sveltepress
  export let fm = {}

  export let siteConfig

  const {
    sidebar = 'auto',
    title,
    description
  } = fm

</script>
<svelte:head>
    <title>{title ? `${title} - ${siteConfig.title}` : siteConfig.title}</title>
    <meta name="description" content="${description || siteConfig.description}">
</svelte:head>
  
{#if !isHome}
  <div pb-4 class="theme-default--page-layout">
    {#if sidebar === 'auto'}
      <Sidebar />
    {/if}
    <div class="content">
      {#if title}
        <h1>
          {title}
        </h1>
      {/if}
      <slot />
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
      border-light-5 dark:border-gray-7 pt-4 mt-8 mb-4;
  }
  .content {
    --at-apply: xl:w-[860px] mx-auto;
  }
</style>