 <script>
  import { page } from '$app/stores'
  const routeId = $page.route.id

  export let title = ''
  export let to = ''

  $$restProps
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
    --at-apply: dark:text-gray-3;
  }
  .sidebar-item:not(.active):hover {
    --at-apply: text-rose-4;
  }
  .sidebar-item.active {
    cursor: default;
  }
  .active {
    --at-apply: svp-gradient-text;
  }
</style>