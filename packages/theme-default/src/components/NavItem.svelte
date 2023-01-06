<script>
  import NavArrowDown from './icons/NavArrowDown.svelte'

  export let item

</script>

 {#if item.items && item.items.length}
  <div class="nav-item">

    {item.title}
    
    <div class="arrow">
      <NavArrowDown />
    </div>
    <!-- {#if showDropdown} -->
      <div class="dropdown">
        {#each item.items as subItem}
          <a href={subItem.to}>
            {subItem.title}
          </a>
        {/each}
      </div>
    <!-- {/if} -->
  </div>
  {:else}
  <a href={item.to} class="nav-item">
    {item.title}
  </a>
  {/if}

<style>
  .nav-item {
    --at-apply: flex items-center cursor-pointer 
      position-relative z-1 cursor-pointer px-3 
      decoration-none text-[#232323] dark:text-[#cecece]
      hover:text-blue-5
      dark:hover:text-blue-7;
  }
  .dropdown {
    --at-apply: transition-transform transition-opacity  transition-300
      translate-y-[72px] opacity-0 pointer-events-none 
      absolute top-0 right-0 
      bg-white dark:bg-[#232323]
      whitespace-nowrap z-3 rounded shadow-sm p-2;
  }
  .nav-item:hover .dropdown {
    --at-apply: translate-y-[40px] opacity-100 pointer-events-initial;
  }
  .dropdown > a {
    --at-apply: block py-2 px-4 decoration-none rounded
      text-[#232323] dark:text-[#cecece] 
      hover:bg-blue-1 hover:text-blue-5;
  }
  .arrow {
    --at-apply: flex items-center
      transition-transform transition-300  text-6 tra;
  }
  .nav-item:hover .arrow {
    --at-apply: rotate-180;
  }
</style>

