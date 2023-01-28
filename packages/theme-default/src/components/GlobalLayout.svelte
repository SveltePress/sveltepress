<script>
  import '../style.css'
  import AjaxBar from './AjaxBar.svelte'
  import { sidebarCollapsed } from './layout'
  import Navbar from './Navbar.svelte'
  import Sidebar from './Sidebar.svelte'
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

<main>
  <AjaxBar bind:this={ajaxBar} />
  <Navbar />
  <div class="sidebar-mobile-home">
    <Sidebar />
  </div>
  <slot />
</main>

<style>
  main {
    --at-apply: pt-[56px] sm:pt-[73px];
  }
  .sidebar-mobile-home {
    --at-apply: sm:display-none;
  }

</style>