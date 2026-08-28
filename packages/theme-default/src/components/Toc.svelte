<script module>
  export const DEFAULT_ON_THIS_PAGE = 'On this page'
</script>

<script>
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { onMount, tick } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Backdrop from './Backdrop.svelte'
  import { changedSectionIds, tocCollapsed } from './layout'
  import VersionNavigationBadge from './VersionNavigationBadge.svelte'

  /**
   * @typedef {object} Props
   * @property {Array<import('../markdown/anchors').Anchor>} [anchors] - The anchors to display in the TOC.
   */

  /** @type {Props} */
  const { anchors = [] } = $props()
  const newBadgeLabel = $derived(
    themeOptions.i18n?.versionNavigationNewLabel ?? 'New',
  )

  let scrollY = $state()

  // All sections intersecting the viewport are active, Nuxt-style:
  // [firstActiveIdx, lastActiveIdx]
  let activeRange = $state([0, 0])

  afterNavigate(() => {
    activeRange = [0, 0]
  })

  let mounted = false

  function computeActiveRange() {
    if (!mounted || !anchors.length) return
    const positions = anchors.map(
      ({ slugId }) => document.getElementById(slugId)?.offsetTop ?? 0,
    )
    const viewportTop = scrollY ?? 0
    const viewportBottom = viewportTop + window.innerHeight
    const docBottom = document.documentElement.scrollHeight
    let first = -1
    let last = 0
    for (let i = 0; i < positions.length; i++) {
      // a section spans from its own anchor to the next one (or page end)
      const start = positions[i]
      const end = i + 1 < positions.length ? positions[i + 1] : docBottom
      if (start < viewportBottom && end > viewportTop) {
        if (first === -1) first = i
        last = i
      }
    }
    if (first === -1) first = last = 0
    activeRange = [first, last]
  }

  $effect(() => {
    computeActiveRange(scrollY)
  })

  onMount(() => {
    mounted = true
    const anchorTarget = decodeURI(page.url.hash)
    if (!anchorTarget) {
      computeActiveRange()
      return
    }
    try {
      const ele = document.querySelector(anchorTarget)
      if (ele) scrollY = ele.offsetTop
    } catch {
      // Invalid query selector, ignore
    }
    tick().then(computeActiveRange)
  })

  function handleTocToggleClick() {
    $tocCollapsed = !$tocCollapsed
  }
</script>

<svelte:window bind:scrollY onresize={computeActiveRange} />
{#if anchors.length}
  <div class="toc" class:collapsed={$tocCollapsed}>
    <div class="title">
      {themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE}
    </div>
    <div
      class="anchors"
      style={`--bar-top: ${activeRange[0] * 2}em; --bar-height: ${(activeRange[1] - activeRange[0] + 1) * 2}em;`}
    >
      {#each anchors as an, i}
        {@const active = i >= activeRange[0] && i <= activeRange[1]}
        <a
          href="#{an.slugId}"
          class="item"
          class:active
          style="--heading-depth: {an.depth < 2 ? 2 : an.depth};"
        >
          <span class="item-label">{an.title}</span>
          {#if an.versionChangeId && $changedSectionIds.has(an.versionChangeId)}<VersionNavigationBadge
              label={newBadgeLabel}
            />{/if}
        </a>
      {/each}
      <div class="active-bar"></div>
    </div>
  </div>
{/if}

<Backdrop show={!$tocCollapsed} on:close={handleTocToggleClick} />

<style>
  .toc {
    --at-apply: 'transition-transform transition transition-300 py-4 text-gray-5 dark:text-gray-2 sm:z-3 leading-[2em] bottom-0 right-0 sm:top-[80px] fixed text-3.5 w-[70vw] bg-white dark:bg-[#1c1c1f] sm:bg-transparent top-0 z-988 sm:dark:bg-transparent box-border sm:w-[calc(max(0px,(100vw-1440px)/2)+min(22vw,256px))] sm:pr-[max(0px,calc((100vw-1440px)/2))]';
  }
  .toc a {
    --at-apply: 'text-zinc-6 dark:text-zinc-4 transition-colors transition-150';
  }
  .title {
    --at-apply: 'font-600 pl-4 mb-1 text-zinc-8 dark:text-zinc-2 text-3.5';
  }
  .item {
    --at-apply: 'relative z-3 flex min-w-0 items-center cursor-pointer';
    padding-left: calc(1rem + (var(--heading-depth) - 2) * 1.2em);
  }
  .item-label {
    --at-apply: 'min-w-0 truncate';
  }
  .item:hover {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary';
  }
  .toc a.active {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary font-500';
  }

  .anchors {
    --at-apply: 'relative z-3 sm:w-[min(15vw,224px)] max-h-[70vh] overflow-y-auto overflow-x-hidden';
  }
  .anchors::after {
    --at-apply: 'absolute left-[1px] top-0 bottom-0 w-[1px] bg-black/8 dark:bg-white/10 hidden sm:block';
    content: ' ';
  }
  .active-bar {
    --at-apply: 'absolute z-2 left-0 border-l-[3px] border-l-solid border-svp-primary border-opacity-80 w-full top-0';
    height: var(--bar-height, 2em);
    transform: translateY(var(--bar-top));
    transition:
      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .collapsed {
    --at-apply: 'sm:translate-x-0';
    transform: translateX(100%);
  }
</style>
