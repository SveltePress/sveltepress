<script lang="ts">
  import { PERSIST_CAVEAT } from './_catalog'

  let { compact = false }: { compact?: boolean } = $props()
</script>

<p class="caveat" class:compact>
  {PERSIST_CAVEAT}
</p>

<style>
  .caveat {
    --at-apply: 'm-0 text-[12px] leading-5 text-zinc-5 dark:text-zinc-4';
  }
  .compact {
    --at-apply: 'text-[11px] leading-4 line-clamp-2';
  }
</style>
