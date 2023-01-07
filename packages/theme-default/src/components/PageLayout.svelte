<script >
  import { getSidebars } from '@svelte-press/vite/client'
  import { page } from '$app/stores'

  const routeId = $page.route.id

  const sidebars = getSidebars(routeId)

  // The frontmatter info. This would be injected by sveltepress
  export let fm = {}

  export let siteConfig

  const { 
    sidebar = 'auto', 
    features = [],
    heroImage,
  } = fm


  $: isHome = $page.route.id === '/'
</script>
  
{#if !isHome}
  <div text-md flex>
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
        <slot />
      </div>
    </div>
  </div>
{:else}
  <div class="home-page">
    <div class="title">
      <div>
        <div>
          {siteConfig.title}
        </div>
        <div>
          {siteConfig.description}
        </div>
      </div>
      {#if heroImage}
        <div>
          <img src={heroImage} alt={siteConfig.title} />
        </div>
      {/if}
    </div>
    <div class="features">
      {#each features as fe}
        <div>
          <div>
            Icon
            <!-- TODO: add icons -->
          </div>
          <div>
            {fe.title}
          </div>
          <div>
            {fe.description}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .home-page {
    --at-apply: max-w-[1152px] mx-auto;
  }
  .title {
    --at-apply: text-16 flex justify-between;
  }
</style>