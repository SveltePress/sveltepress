<script>
  import pages from 'sveltepress:pages'
  import { page } from '$app/stores'

  console.log(pages, $page)
</script>

<div text-md>
  Default Theme Page Layout
</div>
<slot />