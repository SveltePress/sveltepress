<script>
  import pages from 'sveltepress:pages'
  import { page } from '$app/stores'

  const routeId = $page.route.id
  const sidebars = pages.filter(page => page.startsWith(routeId))

  console.log('sidebars: ', sidebars)
</script>
  
<div text-md>
  Default Theme Page Layout
</div>
<hr>
<slot />