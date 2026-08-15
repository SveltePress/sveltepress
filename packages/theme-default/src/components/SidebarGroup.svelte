<script>
  import { page } from '$app/state'
  import { slide } from 'svelte/transition'
  import ArrowDown from './icons/ArrowDown.svelte'
  import Link from './Link.svelte'
  import SidebarGroup from './SidebarGroup.svelte'
  import { isLinkActive } from './utils'

  const routeId = $derived(page.route.id)

  /**
   * @typedef {object} Props
   * @property {any} [items] - Sidebar items
   * @property {string} [title] - Sidebar title
   * @property {boolean} [collapsible] - Whether the sidebar is collapsible
   * @property {boolean} [nested] - Whether the sidebar is nested
   */

  /** @type {Props} */
  const {
    items = [],
    title = '',
    collapsible = false,
    nested = false,
  } = $props()

  let collapsed = $state(false)

  function handleToggle() {
    collapsed = !collapsed
  }
</script>

<div class="sidebar-group" class:nested>
  <div class="group-title" class:with-mb={!nested}>
    <div>
      {title}
    </div>
    {#if collapsible}
      <div
        class="collapse-control"
        onclick={handleToggle}
        onkeypress={handleToggle}
        role="button"
        tabindex="0"
        aria-label="Collapsable button"
      >
        <div class="arrow" class:collapsed>
          <ArrowDown />
        </div>
      </div>
    {/if}
  </div>
  {#if !collapsed}
    <div class="links" transition:slide>
      {#each items as item}
        {@const active = isLinkActive(item.to, routeId)}
        {#if Array.isArray(item.items) && item.items.length}
          <SidebarGroup {...item} nested />
        {:else}
          <Link
            to={item.to}
            {active}
            label={item.title}
            inline={false}
            highlight={false}
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .nested {
    --at-apply: 'pl-4 mt-2';
  }
  .with-mb {
    --at-apply: 'mb-1 sm:mb-2';
  }
  .sidebar-group:not(:last-of-type) {
    --at-apply: 'border-b-solid border-b border-black/5 dark:border-b-white/8 mb-3 pb-3';
  }
  /* pl matches the links' inner padding so every label lines up on one edge,
     while pills and the group rule share the outer edge */
  .group-title {
    --at-apply: 'font-600 text-slate-8 dark:text-zinc-2 flex items-center justify-between pl-3';
  }
  .links {
    --at-apply: 'overflow-hidden text-[14px]';
  }
  .links > :global(.link) {
    --at-apply: 'px-3 py-1.5 my-px leading-5 rounded-md transition-colors transition-150 text-slate-7 dark:text-zinc-3';
  }
  .links > :global(.link:not(.active):hover) {
    --at-apply: 'bg-black/4 dark:bg-white/6';
  }
  .links > :global(.link.active) {
    --at-apply: 'bg-svp-primary/8 dark:bg-svp-primary/12 text-svp-primary-deep dark:text-svp-primary font-600';
  }
  .collapse-control {
    --at-apply: 'transition transition-200 transition-bg transition-transform cursor-pointer text-5 hover:bg-gray-2 active:bg-gray-3 dark:hover:bg-gray-8 dark:active:bg-gray-7 w-[28px] h-[28px] flex items-center justify-center rounded';
  }
  .arrow {
    --at-apply: 'flex items-center transition-300 transition-transform';
  }
  .collapsed {
    --at-apply: 'rotate--90';
  }
</style>
