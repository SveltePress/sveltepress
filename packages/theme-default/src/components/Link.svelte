<script>
  import External from './icons/External.svelte'
  export let label = ''
  export let to = ''
  export let inline = true
  export let active = false
  export let highlight = true

  $: isExternal = /^https?/.test(to)
</script>

<a
  href={to}
  class="link"
  class:inline
  class:active
  class:highlight
  {...isExternal ? { target: '_blank' } : {}}
>
  <div>
    {label}
  </div>
  {#if isExternal}
    <External />
  {/if}
</a>

<style>
  .highlight {
    --at-apply: text-rose-4;
  }
  .link {
    --at-apply: 'flex hover:text-rose-5 cursor-pointer items-center transition-200 transition-color';
  }
  .inline {
    --at-apply: inline-flex;
  }
  .active {
    --at-apply: 'svp-gradient-text hover:svp-gradient-text cursor-default';
  }
</style>
