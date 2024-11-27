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
  <div class="svp-code-bock--copy-code">
    <CopyDone />
  </div>
{:else}
  <div
    bind:this={container}
    class="svp-code-bock--copy-code"
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
  :global(.svp-code-bock--copy-code) {
    --at-apply: 'opacity-0 events-none absolute top-[6px] right-[12px] cursor-pointer z-200 w-[28px] h-[28px] text-4 rounded-lg border-solid border-2 border-gray-3 hover:border-svp-primary hover:text-svp-primary flex items-center justify-center transition-all transition-300';
  }
  :global(.svp-code-block:hover .svp-code-bock--copy-code) {
    --at-apply: 'opacity-100 events-all';
  }
</style>
