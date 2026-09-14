<script>
  import PrototypeSwitcher from './PrototypeSwitcher.svelte'

  const { children } = $props()
</script>

<div class="prototype-offset">
  {@render children?.()}
</div>
<PrototypeSwitcher />

<style>
  .prototype-offset {
    --at-apply: 'pt-14 sm:pt-[73px]';
  }
</style>
