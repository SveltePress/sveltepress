<script module>
  export const DEFAULT_ON_THIS_PAGE = 'On this page'

  const TOC_MIN_DEPTH = 2
  const TOC_ROW_HEIGHT_EM = 2
  const SVG_UNITS_PER_EM = 16
  const SVG_ROW_HEIGHT = TOC_ROW_HEIGHT_EM * SVG_UNITS_PER_EM
  const SVG_TURN_OFFSET = 6
  const SVG_ROOT_X = 0.5
  const SVG_DEPTH_X_STEP = 10
  const SVG_MIN_WIDTH = 12

  /**
   * @param {number} depth
   */
  export function getTocHeadingLevel(depth) {
    return Math.max(0, depth - TOC_MIN_DEPTH)
  }

  /**
   * @param {import('../markdown/anchors').Anchor} anchor
   * @param {Set<string>} changedSectionIds
   */
  export function hasTocVersionChange(anchor, changedSectionIds) {
    const versionChangeIds =
      anchor.versionChangeIds ??
      (anchor.versionChangeId ? [anchor.versionChangeId] : [])
    return versionChangeIds.some(id => changedSectionIds.has(id))
  }

  /**
   * @param {Array<import('../markdown/anchors').Anchor>} anchors
   */
  export function createTocCircuit(anchors) {
    if (!anchors.length) return null

    const levels = anchors.map(anchor => getTocHeadingLevel(anchor.depth))
    const maxLevel = Math.max(...levels)
    const svgWidth =
      SVG_MIN_WIDTH + Math.max(0, maxLevel - 1) * SVG_DEPTH_X_STEP
    const svgHeight = anchors.length * SVG_ROW_HEIGHT
    let currentX = SVG_ROOT_X
    let path = ''

    levels.forEach((level, index) => {
      const targetX = SVG_ROOT_X + level * SVG_DEPTH_X_STEP
      const rowTop = index * SVG_ROW_HEIGHT
      const rowBottom = rowTop + SVG_ROW_HEIGHT

      if (index === 0) {
        path += `M${targetX} ${rowTop}`
        currentX = targetX
      }

      if (targetX !== currentX) {
        path += ` L${targetX} ${rowTop + SVG_TURN_OFFSET}`
        currentX = targetX
      }

      const nextLevel = levels[index + 1]
      const turnOffset =
        nextLevel !== undefined && nextLevel !== level ? SVG_TURN_OFFSET : 0
      path += ` L${currentX} ${rowBottom - turnOffset}`
    })

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}"><path d="${path}" stroke="black" stroke-width="1" fill="none"/></svg>`

    return {
      height: `${anchors.length * TOC_ROW_HEIGHT_EM}em`,
      mask: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
      path,
      width: `${svgWidth / SVG_UNITS_PER_EM}rem`,
    }
  }
</script>

<script>
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { onMount, tick } from 'svelte'
  import Backdrop from './Backdrop.svelte'
  import { changedSectionIds, tocCollapsed } from './layout'
  import { resolveLocaleOptions } from './locale'
  import VersionNavigationBadge from './VersionNavigationBadge.svelte'

  /**
   * @typedef {object} Props
   * @property {Array<import('../markdown/anchors').Anchor>} [anchors] - The anchors to display in the TOC.
   */

  /** @type {Props} */
  const { anchors = [] } = $props()
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const newBadgeLabel = $derived(
    localeOptions.i18n?.versionNavigationNewLabel ?? 'New',
  )
  const circuit = $derived(createTocCircuit(anchors))

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
      {localeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE}
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
          style="--heading-level: {getTocHeadingLevel(an.depth)};"
        >
          <span class="item-label">{an.title}</span>
          {#if hasTocVersionChange(an, $changedSectionIds)}<VersionNavigationBadge
              label={newBadgeLabel}
            />{/if}
        </a>
      {/each}
      {#if circuit}
        <div
          class="circuit-indicator"
          style={`--circuit-mask: ${circuit.mask}; --circuit-width: ${circuit.width}; --circuit-height: ${circuit.height};`}
        >
          <div class="circuit-line"></div>
          <div class="active-bar"></div>
        </div>
      {/if}
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
    padding-left: calc(2.625rem + var(--heading-level) * 0.75rem);
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
  .circuit-indicator {
    --at-apply: 'absolute z-2 left-[1.625rem] top-0 pointer-events-none';
    width: var(--circuit-width);
    height: var(--circuit-height);
    mask-image: var(--circuit-mask);
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
    -webkit-mask-image: var(--circuit-mask);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
  }
  .circuit-line {
    --at-apply: 'absolute inset-0 bg-black/8 dark:bg-white/10';
  }
  .active-bar {
    --at-apply: 'absolute z-2 left-0 top-0 bg-svp-primary opacity-80 w-full';
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
