<script>
  export let sidebars = []
</script>

<aside class="theme-default-sidebar">
  {#each sidebars as sidebarItem}
    <a href={sidebarItem}>
      {sidebarItem}1
    </a>
  {/each}
</aside>

<style>
  .theme-default-sidebar {
    --at-apply: ;
  }
</style>