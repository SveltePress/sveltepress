<script>
  import NavArrowDown from './icons/NavArrowDown.svelte'

  export let title = ''
  export let to = '/'
  export let items = []
  export let icon = false

  export let external = false

  const handleClick = () => {
    if (external)
      window.open(to, '_blank')
  }
</script>

 {#if items && items.length}
  <div class="nav-item">
    {title}
    <div class="arrow">
      <NavArrowDown />
    </div>
    <div class="dropdown">
      {#each items as subItem}
        <a href={subItem.to} rel={external ? '' : 'noreferrer'}>
          {subItem.title}
        </a>
      {/each}
    </div>
  </div>
  {:else}
  <svelte:element 
    this={external ? 'div' : 'a'} 
    href={to} 
    class={`nav-item ${icon ? 'nav-item--icon' : ''}`} 
    target={external ? '_blank' : ''}
    on:click={handleClick}
    on:keypress={handleClick}
  >
    <slot>
      {title}
    </slot>
  </svelte:element>
  {/if}

<style>
  .nav-item {
    --at-apply: flex items-center cursor-pointer 
      position-relative z-1 cursor-pointer px-3 
      decoration-none;
  }
  .nav-item--icon:hover {
    --at-apply: opacity-80;
  }
  .nav-item:not(.nav-item--icon):hover {
    color: transparent;
    background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
    background-clip: text;
    -webkit-background-clip: text;
  }
  .dropdown {
    --at-apply: transition-transform transition-opacity  transition-300
      translate-y-[72px] opacity-0 pointer-events-none 
      absolute top-0 right-0 
      bg-white dark:bg-[#232323]
      whitespace-nowrap z-3 rounded shadow-sm p-2;
  }
  .nav-item:hover .dropdown {
    --at-apply: translate-y-[50px] opacity-100 pointer-events-initial;
  }
  .dropdown > a {
    --at-apply: block py-2 px-4 decoration-none rounded
      hover:bg-orange-1 hover:text-red-5
      dark:hover:bg-orange-9
      text-[#213547] dark:text-[#efefef];
  }
  .arrow {
    --at-apply: flex items-center
      transition-transform transition-300  text-6 text-[#213547] dark:text-light-4;
  }
  .nav-item:hover .arrow {
    --at-apply: rotate-180;
  }
</style>

