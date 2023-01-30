<script>
  import External from './icons/External.svelte'
  import { goto } from '$app/navigation'
  export let label = ''
  export let to = ''
  export let inline = true
  export let active = false
  export let highlight = true

  $: isExternal = /^https?/.test(to)

  const handleClick = () => {
    if (!to)
      return
    if (isExternal) {
      window.open(to, '_blank')
      return
    }
    goto(to)
  }
</script>

<div 
  on:click={handleClick} 
  on:keyup={handleClick} 
  class="link" 
  class:inline 
  class:active
  class:highlight
>
  <div>
    {label}
  </div>
  {#if isExternal}
    <External />
  {/if}
</div>

<style>
  .highlight {
    --at-apply: text-rose-4;
  }
  .link {
    --at-apply: flex hover:text-rose-5 cursor-pointer
      items-center transition-200 transition-color;
  }
  .inline {
    --at-apply: inline-flex;
  }
  .active {
    --at-apply: svp-gradient-text hover:svp-gradient-text cursor-default;
  }
</style>