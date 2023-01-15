<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Logo from './Logo.svelte'
  import Github from './icons/Github.svelte'
  import NavItem from './NavItem.svelte'
  import ToggleDark from './ToggleDark.svelte'
  import { page } from '$app/stores'

  const routeId = $page.route.id
  const isHome = routeId === '/'

</script>

<header class="header">
  <div class="header-inner">
    {#if isHome}
      <Logo />
    {:else}
      <div>
      </div>
    {/if}
  
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

      <div class="divider"></div>
      <ToggleDark />
    </nav>
  </div>
</header>

<style>
  .header {
    --at-apply: 
      fixed top-0 left-0 right-0 px-20 h-[73px] 
      z-999 dark:bg-opacity-40;
    backdrop-filter: blur(5px);
  }
  .header-inner {
    --at-apply: max-w-[1440px] h-full 
      flex items-stretch justify-between
      mx-auto;
  }
  .divider {
    --at-apply: bg-stone-2 w-[1px] my-4 dark:bg-stone-7;
  }
</style>