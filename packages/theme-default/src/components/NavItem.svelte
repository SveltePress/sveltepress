<script>
  import NavArrowDown from './icons/NavArrowDown.svelte'

  export let item

</script>

 {#if item.items && item.items.length}
  <div class="nav-item">

    {item.title}
    <NavArrowDown />
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
    --at-apply: transition-300 absolute top-0 right-0 opacity-0 translate-y-[72px] 
      transition-300 pointer-events-none bg-white dark:bg-[#232323]
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
</style>

