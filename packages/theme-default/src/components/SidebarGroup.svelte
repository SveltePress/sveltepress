<script>
  import Link from './Link.svelte'
  import { page } from '$app/stores'
  const routeId = $page.route.id

  export let items = []
  export let title = ''
</script>

<div class="sidebar-group">
  <div class="group-title">
    {title}
  </div>
  <div class="links">
    {#each items as {to, title}}
      {@const active = routeId.endsWith('/') ? to === routeId : to === `${routeId}/`}
      <Link {to} {active} label={title} inline={false} highlight={false} />
    {/each}
  </div>
</div>

<style>
  .sidebar-group:not(:last-of-type) {
    --at-apply: border-b-solid border-b 
      border-light-8 dark:border-b-gray-7 mb-4 pb-4;
  }
  .group-title {
    --at-apply: font-bold text-slate-8 dark:text-slate-2 mb-2 sm:mb-4;
  }
  .links {
    --at-apply: leading-8;
  }
</style>