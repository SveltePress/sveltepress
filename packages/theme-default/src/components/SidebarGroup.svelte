<script>
  import SidebarItem from './SidebarItem.svelte'

  export let items = []
  export let title = ''
</script>

<div class="sidebar-group">
  <div class="group-title">
    {title}
  </div>
  {#each items as item}
    <SidebarItem {...item} />
  {/each}
</div>

<style>
  .sidebar-group:not(:last-of-type) {
    --at-apply: border-b-solid border-b border-light-8 dark:border-b-gray-7 mb-4 pb-4;
  }
  .group-title {
    --at-apply: font-bold text-slate-8 dark:text-slate-2 mb-4;
  }
</style>