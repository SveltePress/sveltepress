<script>
  import { goto } from  '$app/navigation'
  import External from './icons/External.svelte';
  export let label = ''
  export let to = ''

  const isExternal = /^https?/.test(to)


  const handleClick = () => {
    if(!to) return
    if(isExternal) {
      window.open(to, '_blank')
      return
    } 
    goto(to)
  }
</script>

<div on:click={handleClick} on:keyup={handleClick} class="link">
  <div>
    {label}
  </div>
  {#if isExternal}
    <External />
  {/if}
</div>

<style>
  .link {
    --at-apply: inline-flex text-rose-4 hover:text-rose-5 cursor-pointer
      items-center;
  }
</style>