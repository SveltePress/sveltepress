 <script>
  import { page } from '$app/stores'
  const routeId = $page.route.id

  export let title = ''
  export let to = ''

  const isActive = routeId.endsWith('/') ? to === routeId : to === `${routeId}/`

</script>
 
 <a href={to} class="sidebar-item" class:active={isActive}>
  {title}
</a>

<style>
  .sidebar-item {
    --at-apply: block leading-8 transition-text transition-color;
  }
  .sidebar-item:not(.active) {
    --at-apply: hover:text-rose-4 dark:text-gray-3;
  }
  .sidebar-item.active {
    cursor: default;
  }
  .active {
    color: transparent;
    background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
    background-clip: text;
    -webkit-background-clip: text;
  }
</style>