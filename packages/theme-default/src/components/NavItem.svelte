<script>
  import { page } from '$app/stores'
  import External from './icons/External.svelte'
  import NavArrowDown from './icons/NavArrowDown.svelte'
  // eslint-disable-next-line import/no-self-import
  import Self from './NavItem.svelte'
  import { getPathFromBase } from './utils'

  /**
   * @typedef {object} Props
   * @property {string} [title] - Link title
   * @property {string} [to] - Link URL
   * @property {any} [items] - Submenu items
   * @property {string | boolean} [icon] - Icon
   * @property {boolean} [external] - Whether the link is external
   * @property {boolean} [builtInIcon] - Whether the icon is built-in
   * @property {import('svelte').Snippet} [children] - Children content
   */

  /** @type {Props & { [key: string]: any }} */
  const {
    title = '',
    to = '/',
    items = [],
    icon = false,
    external = false,
    builtInIcon = false,
    children,
    ...rest
  } = $props()

  let active = $derived(
    $page.url.pathname.startsWith(`${to.endsWith('/') ? to : `${to}/`}`),
  )
  // eslint-disable-next-line no-unused-expressions
  rest
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
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html icon}
    {:else}
      {title}
      <div class="arrow">
        <NavArrowDown />
      </div>
    {/if}
    <div class="dropdown">
      {#each items as subItem}
        <Self {...subItem} />
      {/each}
    </div>
  </div>
{:else}
  <a
    href={external ? to : getPathFromBase(to)}
    class:nav-item--icon={icon}
    class="nav-item"
    class:active
    {...external ? { target: '_blank' } : {}}
    aria-label={title}
  >
    {#if children}{@render children()}{:else}
      {#if typeof icon === 'string'}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html icon}
      {:else}
        {title}
      {/if}
      {#if external}
        <External />
      {/if}
    {/if}
  </a>
{/if}

<style>
  .nav-item {
    --at-apply: 'flex items-center cursor-pointer position-relative z-1 cursor-pointer decoration-none px-3';
  }
  .nav-item--icon {
    --at-apply: text-6;
  }
  .nav-item--icon .dropdown {
    --at-apply: 'text-4';
  }
  .nav-item--icon:not(:first-child)::after,
  :global(.navbar-pc .toggle::after) {
    --at-apply: 'absolute left-0 bg-stone-2 w-[1px] top-[50%] h-[20px] dark:bg-stone-7';
    transform: translateY(-50%);
    content: ' ';
  }
  .nav-item--icon:first-of-type::after {
    --at-apply: 'hidden sm:display-[unset]';
  }

  .nav-item--icon:hover {
    --at-apply: 'opacity-80';
  }
  :global(:not(.dropdown) > .nav-item:not(.nav-item--icon):hover) {
    --at-apply: 'svp-gradient-text';
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
    --at-apply: 'opacity-100 pointer-events-initial';
    transform: translateY(54px);
  }
  .arrow {
    --at-apply: 'flex items-center transition-transform transition-300 text-6 text-[#213547] dark:text-light-4';
  }
  .nav-item:hover .arrow {
    transform: rotate(180deg);
  }
  .active {
    --at-apply: 'svp-gradient-text hover:svp-gradient-text cursor-default';
  }
</style>
