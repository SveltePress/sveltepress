<script>
  import { scale, slide } from 'svelte/transition'
  import Link from './Link.svelte'
  import ArrowDown from './icons/ArrowDown.svelte'
  import PointLeft from './icons/PointLeft.svelte'
  import { page } from '$app/stores'

  $: routeId = $page.route.id

  export let items = []
  export let title = ''
  export let collapsible = false
  export let nested = false

  let collapsed = false

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
        on:click={handleToggle}
        on:keypress={handleToggle}
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
        {@const active = routeId.endsWith('/')
          ? item.to === routeId
          : item.to === `${routeId}/`}
        {#if Array.isArray(item.items) && item.items.length}
          <svelte:self {...item} nested />
        {:else}
          <Link
            to={item.to}
            {active}
            label={item.title}
            inline={false}
            highlight={false}
          >
            {#if active}
              <div transition:scale class="active-icon">
                <PointLeft />
              </div>
            {/if}
          </Link>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .nested {
    --uno: 'pl-4';
  }
  .with-mb {
    --uno: 'mb-2 sm:mb-4';
  }
  .sidebar-group:not(:last-of-type) {
    --at-apply: 'border-b-solid border-b border-light-8 dark:border-b-gray-7 mb-4 pb-4';
  }
  .group-title {
    --at-apply: 'font-bold text-slate-8 dark:text-slate-2 flex items-center justify-between';
  }
  .links {
    --at-apply: leading-8 overflow-hidden;
  }
  .collapse-control {
    --at-apply: 'transition transition-200 transition-bg transition-transform cursor-pointer text-5 hover:bg-gray-2 active:bg-gray-3 dark:hover:bg-gray-8 dark:active:bg-gray-7 w-[28px] h-[28px] flex items-center justify-center rounded';
  }
  .arrow {
    --at-apply: flex items-center transition-300 transition-transform;
  }
  .collapsed {
    --at-apply: rotate--90;
  }
  .active-icon {
    --at-apply: 'text-svp-primary ml-4 flex items-center text-5';
  }
</style>
