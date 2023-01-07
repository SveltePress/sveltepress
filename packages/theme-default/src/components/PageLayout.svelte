<script >
  import { getSidebars } from '@svelte-press/vite/client'
  import { page } from '$app/stores'

  const routeId = $page.route.id

  const sidebars = getSidebars(routeId)

  export let sidebar = 'auto'

  const restFm = $$restProps

  $: isHome = $page.route.id === '/'
</script>
  
<div text-xl>
  Page Layout
</div>
<div text-md flex>
  {#if sidebar === 'auto' && !isHome}
    <aside>
      {#each sidebars as sidebarItem}
        <div>
          {sidebarItem}
        </div>
      {/each}
    </aside>
  {/if}
  <div flex-grow>
    <div md:w-200 lg:w-230 xl:w-260>
      <slot />
    </div>
  </div>
</div>
<hr>