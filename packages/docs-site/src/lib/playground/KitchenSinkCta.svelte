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

<a class="cta" {href} aria-label={copy.title}>
  <span class="kicker">{copy.kicker}</span>
  <span class="title">{copy.title}</span>
  <span class="hint">{copy.hint}</span>
</a>

<style>
  .cta {
    --at-apply: 'flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 b-b-1 b-b-solid b-b-black/8 dark:b-b-white/10 bg-[#f0f0f2] dark:bg-[#141417] no-underline text-inherit block min-w-0';
  }
  .kicker {
    --at-apply: 'text-[11px] font-600 text-zinc-5 dark:text-zinc-4';
  }
  .title {
    --at-apply: 'text-[15px] font-700 text-svp-primary-deep dark:text-svp-primary';
  }
  .hint {
    --at-apply: 'text-[12px] text-zinc-5 dark:text-zinc-4';
  }
</style>
