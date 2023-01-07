<script>
  import themeOptions from 'sveltepress:theme-default'
  import siteConfig from 'sveltepress:site'
  import Github from './icons/Github.svelte'
  import NavItem from './NavItem.svelte'
</script>

<header class="header">
  <div class="header-inner">
    <NavItem to="/" title={siteConfig.title}>
      {#if themeOptions.logo}
        <img class="logo" src={themeOptions.logo} alt={siteConfig.title} />
        <span font-600 ml-2>
          {siteConfig.title}
        </span>
      {/if}
    </NavItem>
  
    <nav flex items-stretch>
      {#each themeOptions.navbar as navItem}
       <NavItem {...navItem}/>
      {/each}
  
      {#if themeOptions.github}
        <div class="divider"></div>
        <NavItem to={themeOptions.github} external icon>
          <Github class="text-8" />
        </NavItem>
      {/if}
    </nav>
  </div>
</header>

<style>
  .header {
    --at-apply: 
      fixed top-0 left-0 right-0 bg-white 
      dark:bg-[#232323] px-20 h-[56px] 
      z-999;
  }
  .header-inner {
    --at-apply: max-w-[1440px] h-full 
      flex items-stretch justify-between
      mx-auto;
  }
  .divider {
    --at-apply: bg-light w-[1px] my-3;
  }
  .logo {
    --at-apply: h-[32px];
  }
</style>