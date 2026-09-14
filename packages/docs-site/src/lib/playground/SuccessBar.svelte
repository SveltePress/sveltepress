<script lang="ts">
  import type { CatalogLocale, SuccessKind } from './catalog.ts'
  import { playgroundCopy } from './copy.ts'

  let {
    kinds,
    note = '',
    locale,
  }: {
    kinds: SuccessKind[]
    note?: string
    locale: CatalogLocale
  } = $props()

  const copy = $derived(playgroundCopy(locale))
</script>

<div class="bar">
  {#each kinds as kind (kind)}
    <span class="chip" data-kind={kind}>{copy.success[kind]}</span>
  {/each}
  {#if note}
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
</style>
