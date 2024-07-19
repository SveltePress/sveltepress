<script context="module">
  export const DEFAULT_ON_THIS_PAGE = 'On this page'
</script>

<script>
  import { onMount, tick } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { tocCollapsed } from './layout'
  import Backdrop from './Backdrop.svelte'
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/stores'

  /**
   * @type {Array<import('../markdown/anchors').Anchor>}
   */
  export let anchors = []

  let scrollY

  let activeIdx = 0

  afterNavigate(() => {
    activeIdx = 0
  })

  let mounted = false

  function computeActiveIdx() {
    if (!mounted) return
    const positions = anchors.map(
      ({ slugId }) => document.getElementById(slugId).offsetTop,
    )
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      if (
        scrollY >= pos &&
        (scrollY < positions[i + 1] || i === positions.length - 1)
      ) {
        activeIdx = i
        return
      }
    }
  }

  $: {
    scrollY
    computeActiveIdx()
  }

  onMount(() => {
    mounted = true
    const anchorTarget = decodeURI($page.url.hash)
    if (!anchorTarget) return
    const ele = document.querySelector(anchorTarget)
    if (ele) scrollY = ele.offsetTop
    tick().then(computeActiveIdx)
  })

  function handleTocToggleClick() {
    $tocCollapsed = !$tocCollapsed
  }
</script>

<svelte:window bind:scrollY />
{#if anchors.length}
  <div class="toc" class:collapsed={$tocCollapsed}>
    <div class="title">
      {themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE}
    </div>
    <div class="anchors" style={`--bar-top: calc(${activeIdx * 2}em);`}>
      {#each anchors as an, i}
        {@const active = activeIdx === i}
        <a
          href="#{an.slugId}"
          class="item"
          class:active
          style="--heading-depth: {an.depth < 2 ? 2 : an.depth};"
        >
          {an.title}
        </a>
      {/each}
      <div class="active-bar"></div>
    </div>
  </div>
{/if}

<Backdrop show={!$tocCollapsed} on:close={handleTocToggleClick} />

<style>
  .toc {
    --at-apply: 'transition-transform transition transition-300 py-4 text-gray-5 dark:text-gray-2 sm:z-3 leading-[2em] bottom-0 right-0 sm:top-[80px] fixed text-3.5 sm:w-[22vw] w-[70vw] bg-white dark:bg-zinc-8 sm:bg-transparent top-0 z-988 sm:dark:bg-transparent';
  }
  .toc a {
    --uno: 'text-[#213547] dark:text-gray-3';
  }
  .title {
    --at-apply: 'font-bold pl-4 text-gray-8 dark:text-gray-2';
  }
  .item {
    --at-apply: 'pl-4 relative z-3 block truncate cursor-default';
    text-indent: calc((var(--heading-depth) - 2) * 1.2em);
  }
  .item:not(.active) {
    --at-apply: 'hover:text-svp-primary cursor-pointer';
  }

  .anchors {
    --at-apply: 'relative z-3 sm:w-[15vw] max-h-[70vh] overflow-y-auto overflow-x-hidden';
  }
  .anchors::after {
    --at-apply: 'absolute left-[1px] top-0 bottom-0 w-[1px] bg-light-7 dark:bg-gray-8 hidden sm:block';
    content: ' ';
  }
  .active-bar {
    --at-apply: 'absolute z-2 left-0 h-[2em] border-l-[3px] border-l-solid border-svp-primary border-opacity-80 w-full transition-transform transition-300 top-0';
    transform: translateY(var(--bar-top));
  }
  .collapsed {
    --at-apply: 'sm:translate-x-0';
    transform: translateX(100%);
  }
</style>
