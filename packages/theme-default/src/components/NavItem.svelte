<script>
  import External from './icons/External.svelte'
  import NavArrowDown from './icons/NavArrowDown.svelte'

  export let title = ''
  export let to = '/'
  export let items = []
  export let icon = false

  export let external = false

  const handleClick = () => {
    if (external) window.open(to, '_blank')
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
        <svelte:self {...subItem} />
      {/each}
    </div>
  </div>
{:else}
  <svelte:element
    this={external ? 'div' : 'a'}
    href={to}
    class:nav-item--icon={icon}
    class="nav-item"
    {...external ? { target: '_blank' } : {}}
    on:click={handleClick}
    on:keypress={handleClick}
  >
    <slot>
      {title}
      {#if external}
        <External />
      {/if}
    </slot>
  </svelte:element>
{/if}

<style>
  .nav-item {
    --at-apply: flex items-center cursor-pointer position-relative z-1
      cursor-pointer decoration-none px-3;
  }
  .nav-item--icon {
    --at-apply: text-6;
  }
  .nav-item--icon:hover {
    --at-apply: opacity-80;
  }
  :global(:not(.dropdown) > .nav-item:not(.nav-item--icon):hover) {
    --at-apply: svp-gradient-text;
  }
  .dropdown {
    --at-apply: 'transition-transform transition-opacity transition-300 opacity-0 pointer-events-none  absolute top-0 right-0 bg-white dark:bg-[#232323] whitespace-nowrap z-3 rounded shadow-sm p-2';
    transform: translateY(72px);
  }
  :global(.dropdown > .nav-item) {
    --at-apply: 'block py-2 px-4 decoration-none rounded hover:bg-orange-1 hover:text-red-5 dark:hover:bg-orange-9 text-[#213547] dark:text-[#efefef]';
  }
  :global(.dropdown > .nav-item:hover) {
    background-image: none;
  }
  .nav-item:hover .dropdown {
    --at-apply: opacity-100 pointer-events-initial;
    transform: translateY(54px);
  }
  .arrow {
    --at-apply: 'flex items-center transition-transform transition-300 text-6 text-[#213547] dark:text-light-4';
  }
  .nav-item:hover .arrow {
    transform: rotate(180deg);
  }
</style>
