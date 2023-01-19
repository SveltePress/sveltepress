<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Logo from './Logo.svelte'
  import Github from './icons/Github.svelte'
  import NavItem from './NavItem.svelte'
  import ToggleDark from './ToggleDark.svelte'
  import Search from './Search.svelte'
  import Menu from './icons/Menu.svelte'
  import { sidebarCollapsed } from './layout'
  import Discord from './icons/Discord.svelte'
  import { page } from '$app/stores'
  
  $: routeId = $page.route.id
  $: isHome = routeId === '/'

  const handleMenuClick = () => {
    $sidebarCollapsed = false
  }
</script>

<header class="header">
  <div class="header-inner">
    <div flex items-center>
      {#if isHome}
        <div class="logo-container">
          <Logo />
        </div>
      {/if}
      <div class="menu" on:click={handleMenuClick} on:keyup={handleMenuClick}>
        <Menu  />
      </div>
    </div>
    {#if themeOptions.docsearch}
      <div flex-grow class={isHome ? 'pl-[2vw]' : 'pl-18vw'} flex items-center>
        <Search {...themeOptions.docsearch} />
      </div>
    {/if}
  
    <div class="nav-links flex items-stretch">
      <div class="navbar-pc">
        {#each themeOptions.navbar as navItem}
         <NavItem {...navItem}/>
        {/each}
      </div>
  
      {#if themeOptions.github}
        <span class="divider"></span>
        <NavItem to={themeOptions.github} external icon>
          <Github class="text-6" />
        </NavItem>
      {/if}

      {#if themeOptions.discord}
        <span class="divider"></span>
        <NavItem to={themeOptions.discord} external icon>
          <Discord class="text-6" />
        </NavItem>
      {/if}

      <span class="divider"></span>
      <ToggleDark />
    </div>
  </div>
</header>

<style>
  .header {
    --at-apply: 
      fixed top-0 left-0 right-0 h-[73px] 
      z-999 dark:bg-opacity-40;
    backdrop-filter: blur(5px);
  }
  .logo-container {
    --at-apply: display-none sm:display-block;
  }
  .header-inner {
    --at-apply: sm:w-[70vw] h-full 
      flex items-stretch justify-between
      mx-auto;
  }
  .divider {
    --at-apply: bg-stone-2 w-[1px] my-6 dark:bg-stone-7;
  }
  
  .menu {
    --at-apply: sm:display-none ml-4 flex items-center text-7;
  }
  .navbar-pc {
    --at-apply: items-stretch display-none sm:display-flex;
  }
  .nav-links span:first-of-type {
    --at-apply: display-none sm:display-block;
  }
</style>