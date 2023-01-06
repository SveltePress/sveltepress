<script>
  import themeOptions from 'sveltepress:theme-default'
  import NavItem from './NavItem.svelte'
  
  
</script>

<header class="header">
  <a href="/">
    Logo
  </a>

  <nav flex items-stretch>
    {#each themeOptions.navbar as navItem}
     <NavItem item={navItem}/>
    {/each}
  </nav>
</header>

<style>
  .header {
    --at-apply: 
      fixed top-0 left-0 right-0 bg-white 
      dark:bg-[#232323] px-20 h-[56px] 
      flex items-stretch justify-between
      z-999;
  }
</style>