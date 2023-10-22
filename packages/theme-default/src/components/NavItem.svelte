<script>
  import External from './icons/External.svelte'
  import NavArrowDown from './icons/NavArrowDown.svelte'

  export let title = ''
  export let to = '/'
  export let items = []
  /** @type {string | boolean} */
  export let icon = false
  export let external = false
  export let builtInIcon = false

  function handleClick() {
    if (external) window.open(to, '_blank')
  }

  $$restProps
</script>

{#if items && items.length}
  <div
    class="nav-item"
    class:built-in-icon={builtInIcon}
    class:nav-item--icon={icon}
    class:nav-item--user-icon={icon}
    role="link"
    aria-label={title}
  >
    {#if typeof icon === 'string'}
      {@html icon}
    {:else}
      {title}
      <div class="arrow">
        <NavArrowDown />
      </div>
    {/if}
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
    role="link"
    tabindex="0"
    aria-label={title}
  >
    <slot>
      {#if typeof icon === 'string'}
        {@html icon}
      {:else}
        {title}
      {/if}
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
  .nav-item--icon .dropdown {
    --uno: 'text-4';
  }
  .nav-item--icon:not(:first-child)::after,
  :global(.navbar-pc .toggle::after) {
    --uno: 'absolute left-0 bg-stone-2 w-[1px] top-[50%] h-[20px] dark:bg-stone-7';
    transform: translateY(-50%);
    content: ' ';
  }
  .nav-item--icon:first-of-type::after {
    --uno: 'hidden sm:display-[unset]';
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
    --at-apply: 'block py-2 px-4 decoration-none rounded hover:bg-svp-primary hover:bg-opacity-20 hover:text-svp-primary text-[#213547] dark:text-[#efefef]';
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
