<script>
  import '../style.css'
  import AjaxBar from './AjaxBar.svelte'
  import { sidebarCollapsed } from './layout'
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  
  let ajaxBar

  beforeNavigate(() => {
    ajaxBar.start()
  })

  afterNavigate(() => {
    ajaxBar.end()
    $sidebarCollapsed = true
  })
</script>

<AjaxBar bind:this={ajaxBar} />
<slot />