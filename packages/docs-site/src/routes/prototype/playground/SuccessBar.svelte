<script lang="ts">
  import type { SuccessKind } from './_catalog'

  const labels: Record<SuccessKind, string> = {
    as: 'Author-success',
    degraded: 'Degraded',
    observation: 'Observation-only',
  }

  let {
    kinds,
    note = '',
    compact = false,
  }: {
    kinds: SuccessKind[]
    note?: string
    compact?: boolean
  } = $props()
</script>

<div class="bar" class:compact>
  {#each kinds as kind (kind)}
    <span class="chip" data-kind={kind}>{labels[kind]}</span>
  {/each}
  {#if note && !compact}
    <span class="note">{note}</span>
  {/if}
</div>

<style>
  .bar {
    --at-apply: 'inline-flex flex-wrap items-center gap-1.5 min-w-0';
  }
  .chip {
    --at-apply: 'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-600 leading-none';
  }
  .chip[data-kind='as'] {
    --at-apply: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
  }
  .chip[data-kind='degraded'] {
    --at-apply: 'bg-amber-50 text-amber-800 dark:bg-amber-950/45 dark:text-amber-300';
  }
  .chip[data-kind='observation'] {
    --at-apply: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';
  }
  .note {
    --at-apply: 'text-[12px] text-zinc-5 dark:text-zinc-4 min-w-0';
  }
  .compact .note {
    --at-apply: 'hidden';
  }
</style>
