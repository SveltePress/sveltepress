<script lang="ts">
  import type { CatalogLocale } from './catalog.ts'
  import { kitchenSinkCtaHref } from './catalog.ts'
  import { playgroundCopy } from './copy.ts'

  let {
    locale,
  }: {
    locale: CatalogLocale
  } = $props()

  const copy = $derived(playgroundCopy(locale).kitchenSinkCta)
  const href = $derived(kitchenSinkCtaHref(locale))
</script>

<a class="cta group" {href} aria-label={copy.title}>
  <div class="cta-inner">
    <span class="kicker">{copy.kicker}</span>
    <span class="title">
      {copy.title}
      <span class="sep">/</span>
    </span>
    <span class="hint">{copy.hint}</span>
  </div>
  <span class="arrow" aria-hidden="true">&rarr;</span>
</a>

<style>
  .cta {
    --at-apply: 'shrink-0 relative flex items-center justify-between gap-3 px-4 py-1.5 bg-gradient-to-r from-orange-500/8 via-amber-500/4 to-transparent dark:from-orange-500/15 dark:via-amber-500/8 dark:to-transparent b-b-1 b-b-solid b-b-orange-500/15 dark:b-b-orange-500/20 no-underline text-inherit transition-colors hover:bg-orange-500/12 dark:hover:bg-orange-500/20';
  }
  .cta-inner {
    --at-apply: 'flex flex-wrap items-center gap-x-2.5 gap-y-0.5 min-w-0 text-left';
  }
  .kicker {
    --at-apply: 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-700 tracking-wider uppercase bg-orange-500/15 text-orange-600 dark:bg-orange-400/20 dark:text-orange-300 b-1 b-solid b-orange-500/20';
  }
  .title {
    --at-apply: 'text-[13px] font-700 text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5';
  }
  .sep {
    --at-apply: 'text-zinc-300 dark:text-zinc-600 font-normal';
  }
  .hint {
    --at-apply: 'text-[12px] text-zinc-600 dark:text-zinc-400 truncate';
  }
  .arrow {
    --at-apply: 'text-[14px] font-600 text-orange-500 dark:text-orange-400 transition-transform duration-200 group-hover:translate-x-1 shrink-0';
  }
</style>
