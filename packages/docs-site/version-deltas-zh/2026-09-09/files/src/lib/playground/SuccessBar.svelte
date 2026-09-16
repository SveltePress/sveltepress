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
    <span class="chip" data-kind={kind}>
      <span class="dot" data-kind={kind} aria-hidden="true"></span>
      {copy.success[kind]}
    </span>
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
    --at-apply: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-600 leading-none transition-all';
  }
  .dot {
    --at-apply: 'w-1.5 h-1.5 rounded-full shrink-0';
  }
  .chip[data-kind='as'] {
    --at-apply: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 b-1 b-solid b-emerald-500/25';
  }
  .dot[data-kind='as'] {
    --at-apply: 'bg-emerald-500';
  }
  .chip[data-kind='degraded'] {
    --at-apply: 'bg-amber-50 text-amber-800 dark:bg-amber-950/45 dark:text-amber-300 b-1 b-solid b-amber-500/25';
  }
  .dot[data-kind='degraded'] {
    --at-apply: 'bg-amber-500';
  }
  .chip[data-kind='observation'] {
    --at-apply: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-300 b-1 b-solid b-zinc-400/25';
  }
  .dot[data-kind='observation'] {
    --at-apply: 'bg-zinc-400 dark:bg-zinc-500';
  }
  .note {
    --at-apply: 'text-[11.5px] text-zinc-500 dark:text-zinc-400 min-w-0 font-normal';
  }
</style>
