<script >
  import pages from 'sveltepress:pages'
  import Home from './Home.svelte'
  import { page } from '$app/stores'


  const routeId = $page.route.id
  const isHome = routeId === '/'

  const sidebars = pages.filter(page => page.startsWith(routeId))

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
  <div text-md flex pb-4 class="theme-default--page-layout">
    {#if sidebar === 'auto'}
      <aside>
        {#each sidebars as sidebarItem}
          <div>
            {sidebarItem}
          </div>
        {/each}
      </aside>
    {/if}
    <div flex-grow>
      <div md:w-200 mx-auto lg:w-230 xl:w-260>
        {#if title}
          <h1>
            {title}
          </h1>
        {/if}
        <slot />
      </div>
    </div>
  </div>
{:else}
  <Home {...fm} {siteConfig} />
  <slot />
{/if}

<style>
  :global(.theme-default--page-layout h2) {
    --at-apply: border-t-solid border-t border-light-8 dark:border-gray-7 pt-4 mt-8 mb-4;
  }
</style>