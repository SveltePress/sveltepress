<script>
import Copy from './icons/Copy.svelte'
import CopyDone from './icons/CopyDone.svelte'
let container

let copied = false

const handleClick = () => {
  const content = container?.parentElement?.querySelector('.shiki')?.textContent || ''
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
    on:click={handleClick} 
    on:keyup={handleClick}
  >
    <Copy />
  </div>
{/if}
