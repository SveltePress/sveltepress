<script>
  import { onMount } from 'svelte'
  import { tocCollapsed } from './layout'
  import TocMenu from './icons/TocMenu.svelte'
  import TocClose from './icons/TocClose.svelte'
  import { afterNavigate } from '$app/navigation'

  export let anchors = []

  let scrollY

  let activeIdx = 0

  afterNavigate(() => {
    activeIdx = 0
  })

  let mounted = false

  const computeActiveIdx = () => {
    if (!mounted) return
    const positions = anchors.map(
      ({ slugId }) => document.getElementById(slugId).offsetTop
    )
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      if (
        scrollY >= pos - 10 &&
        (scrollY < positions[i + 1] || i === positions.length - 1)
      )
        activeIdx = i
    }
  }

  $: {
    scrollY
    computeActiveIdx?.()
  }

  onMount(() => {
    mounted = true
  })

  const handleTocToggleClick = () => {
    $tocCollapsed = !$tocCollapsed
  }
</script>

<svelte:window bind:scrollY={scrollY} />
{#if anchors.length}
  <div
    class="mobile-toc-trigger"
    on:click={handleTocToggleClick}
    on:keyup={handleTocToggleClick}>
    {#if $tocCollapsed}
      <TocMenu />
    {:else}
      <TocClose />
    {/if}
  </div>
  <div class="toc" class:collapsed={$tocCollapsed}>
    <div class="title">On this page</div>
    <div class="anchors" style={`--bar-top: calc(${activeIdx * 2}em);`}>
      {#each anchors as an}
        <div>
          <a
            href={`#${an.slugId}`}
            class="item"
            style={`--heading-depth: ${an.depth};`}>
            {an.title}
          </a>
        </div>
      {/each}
      <div class="active-bar" />
    </div>
  </div>
{/if}

<style>
  .toc {
    --at-apply: 'transition-transform transition transition-500 py-4 text-gray-5 dark:text-gray-2 sm:z-3 leading-[2em] bottom-0 right-0 sm:top-[80px] fixed text-3.5 sm:w-[22vw] w-[60vw] bg-white dark:bg-zinc-8 sm:bg-transparent top-0 z-999 sm:dark:bg-transparent';
  }
  .title {
    --at-apply: 'font-bold pl-4 text-gray-8 dark:text-gray-2';
  }
  .item {
    --at-apply: relative z-3 block truncate;
    text-indent: calc((var(--heading-depth) - 2) * 1.2em);
  }

  .anchors {
    --at-apply: 'relative z-3 pl-4 sm:w-[15vw]';
  }
  .anchors::after {
    --at-apply: 'absolute left-[1px] top-0 bottom-0 w-[1px] bg-light-7 dark:bg-gray-8 display-none sm:display-block';
    content: ' ';
  }
  .active-bar {
    --at-apply: 'absolute z-2 bg-rose-1 bg-opacity-80 left-0 h-[2em] border-l-[3px] border-l-solid border-rose-4 border-opacity-80 w-full transition-transform transition-300 top-0 dark:border-rose-8 dark:bg-rose-8 dark:bg-opacity-20';
    transform: translateY(var(--bar-top));
  }
  .mobile-toc-trigger {
    --at-apply: 'sm:display-none fixed bottom-[12px] right-[12px] w-[38px] h-[38px] bg-white dark:shadow-white dark:bg-gray-9 rounded-[19px] shadow-md z-1000 flex items-center justify-center text-6';
  }
  .collapsed {
    --at-apply: 'sm:translate-x-0';
    transform: translateX(100%);
  }
</style>
