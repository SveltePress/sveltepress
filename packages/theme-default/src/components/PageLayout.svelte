<script>
  import { getSidebars } from '@svelte-press/vite/client'
  import { page } from '$app/stores'

  const routeId = $page.route.id

  const sidebars = getSidebars(routeId)

</script>
  
<div text-xl>
  Page Layout
</div>
<div text-md flex>
  <aside>
    {#each sidebars as sidebarItem}
      <div>
        {sidebarItem}
      </div>
    {/each}
  </aside>
  <div flex-grow>
    <slot />
  </div>
</div>
<hr>