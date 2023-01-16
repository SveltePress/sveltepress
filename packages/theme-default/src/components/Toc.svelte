<script>
  import { onMount } from 'svelte'
  import { afterNavigate } from '$app/navigation'

  export let anchors = []

  let scrollY

  let activeIdx = 0

  afterNavigate(() => {
    activeIdx = 0
  })


  let mounted = false

  const computeActiveIdx = () => {
    if (!mounted)
      return
    const positions = anchors.map(({ slugId }) => document.getElementById(slugId).offsetTop)
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      if (scrollY >= pos - 10 && (scrollY < positions[i + 1] || i === positions.length - 1))
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

</script>

<svelte:window bind:scrollY></svelte:window>
{#if anchors.length}
  <div class="toc">
    <div font-bold pl-4>
      On this page
    </div>
    <div class="anchors" style={`--bar-top: calc(${activeIdx * 2}em);`}>
      {#each anchors as an}
        <div>
          <a href={`#${an.slugId}`} class="item">
            {an.title}
          </a>
        </div>
      {/each}
      <div class="active-bar"></div>
    </div>
  </div>
{/if}

<style>
  .toc {
    --at-apply: text-3.5 w-[22vw]
      fixed top-[80px] bottom-0 right-0 z-3 leading-[2em] py-4
      text-gray-5 dark:text-gray-2;
  }
  .item {
    --at-apply: relative z-3 block  truncate;
  }
  
  .anchors {
    --at-apply: relative z-3 pl-4 w-[15vw];
  }
  .anchors::after {
    --at-apply: absolute left-[1px] top-0 bottom-0 w-[1px] bg-light-7 dark:bg-gray-8;
    content: ' ';
  }
  .active-bar {
    --at-apply: absolute z-2 bg-rose-1 left-0 h-[2em] 
      border-l-[3px] border-l-solid border-rose-4
      w-full transition-transform transition-300 top-0
      dark:border-rose-5 dark:bg-rose-8 dark:bg-opacity-50;
    transform: translateY(var(--bar-top));
  }
</style>

