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
    <div class="left">
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
      <div class:is-home={isHome} class:is-not-home={!isHome} class="doc-search">
        <Search {...themeOptions.docsearch} />
      </div>
    {/if}
  
    <nav class="nav-links">
      <div class="navbar-pc">
        {#each themeOptions.navbar as navItem}
         <NavItem {...navItem}/>
        {/each}
      </div>
  
      {#if themeOptions.github}
        <span class="divider"></span>
        <NavItem to={themeOptions.github} external icon>
          <Github />
        </NavItem>
      {/if}

      {#if themeOptions.discord}
        <span class="divider"></span>
        <NavItem to={themeOptions.discord} external icon>
          <Discord />
        </NavItem>
      {/if}

      <span class="divider"></span>
      <ToggleDark />
    </nav>
  </div>
</header>

<style>
  .header {
    --at-apply: 
      fixed top-0 left-0 right-0 h-[56px] sm:h-[73px] 
      z-999 dark:bg-opacity-40;
    backdrop-filter: blur(5px);
  }
  .logo-container {
    --at-apply: display-none sm:display-block;
  }
  .header-inner {
    --at-apply: sm:w-[80vw] h-full 
      flex items-stretch justify-between
      mx-auto;
  }
  .left {
    --at-apply: flex items-center;
  }
  .doc-search {
    --at-apply: flex-grow flex items-center relative transition-500 transition-left;
  }
  .doc-search.is-home {
    --at-apply: left-2;
  }
  .doc-search.is-not-home {
    --at-apply: sm:left-[15.5vw];
  }
  .divider {
    --at-apply: bg-stone-2 w-[1px] my-6 dark:bg-stone-7;
  }
  
  .menu {
    --at-apply: sm:display-none ml-4 flex items-center text-6;
  }
  .navbar-pc {
    --at-apply: items-stretch display-none sm:display-flex;
  }
  .nav-links {
    --at-apply: flex items-stretch;
  }
  .nav-links span:first-of-type {
    --at-apply: display-none sm:display-block;
  }
  
</style>