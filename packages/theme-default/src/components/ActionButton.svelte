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
  <span class="label">
    {label}
  </span>
  {#if external}
    <div class="external-icon">
      <External />
    </div>
  {/if}
</a>

<style>
  .svp-action {
    --at-apply: inline-flex items-center h-12 leading-12 
      rounded-6 px-6 bg-white dark:bg-zinc-9 
      transition-300 transition-shadow
      hover:shadow dark:hover:shadow-gray-6;
  }
  .svp-action--primary {
    --at-apply: svp-gradient-bg;
  }
  .external-icon {
    --at-apply: text-6 ml-2 flex items-center;
  }
  .label {
    --at-apply: flex-grow text-center;
  }
</style>