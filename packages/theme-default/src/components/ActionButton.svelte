<script>
  import External from './icons/External.svelte'

  export let label
  export let type = ''
  export let to
  export let external = false
</script>

<a 
  role="button" 
  href={to} 
  class={`svp-action ${type ? `svp-action--${type}` : ''}`} target={external ? '_blank' : ''}>
  <span class="flex-grow text-center">
    {label}
  </span>
  {#if external}
    <External class="text-6 ml-2" />
  {/if}
</a>

<style>
  .svp-action {
    --at-apply: inline-flex items-center h-12 leading-12 rounded-6 px-6 
      hover:shadow-lg bg-white dark:bg-zinc-9 transition-300 transition-shadow;
  }
  .svp-action--primary {
    background-image: linear-gradient(45deg, #fa709a 0%, #fee140 100%);
  }
</style>