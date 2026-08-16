<script>
  import Copy from './icons/Copy.svelte'
  import CopyDone from './icons/CopyDone.svelte'

  let container = $state()

  let copied = $state(false)

  function handleClick() {
    const content =
      container?.parentElement?.querySelector('.shiki')?.textContent || ''
    navigator.clipboard.writeText(content)
    copied = true
    setTimeout(() => {
      copied = false
    }, 2000)
  }
</script>

{#if copied}
  <div class="svp-code-block--copy-code">
    <CopyDone />
  </div>
{:else}
  <div
    bind:this={container}
    class="svp-code-block--copy-code"
    onclick={handleClick}
    onkeyup={handleClick}
    role="button"
    tabindex="0"
    aria-label="Copy code"
  >
    <Copy />
  </div>
{/if}

<style>
  :global(.svp-code-block--copy-code) {
    --at-apply: 'opacity-0 events-none absolute top-[6px] right-[12px] cursor-pointer z-200 w-[28px] h-[28px] text-4 rounded-md border-solid border-1 border-black/10 dark:border-white/15 bg-white/90 dark:bg-white/10 text-gray-6 dark:text-gray-3 hover:border-svp-primary hover:text-svp-primary flex items-center justify-center transition-all transition-200';
    backdrop-filter: blur(4px);
  }
  :global(.svp-code-block:hover .svp-code-block--copy-code) {
    --at-apply: 'opacity-100 events-all';
  }
</style>
