<script lang="ts">
  import { page } from '$app/state'
  import { playgroundHref } from './_prototype'

  let { tone = 'banner' }: { tone?: 'banner' | 'row' | 'stage' } = $props()
  const href = $derived(playgroundHref('kitchen-sink', page.url))
</script>

<a
  class="cta"
  class:banner={tone === 'banner'}
  class:row={tone === 'row'}
  class:stage={tone === 'stage'}
  {href}
>
  <span class="kicker">All features</span>
  <span class="title">Kitchen sink</span>
  <span class="hint"
    >Largest Default Theme project that can coexist. Not a site-navbar item.</span
  >
</a>

<style>
  .cta {
    --at-apply: 'no-underline text-inherit block min-w-0';
  }
  .banner {
    --at-apply: 'flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 b-b-1 b-b-solid b-b-black/8 dark:b-b-white/10 bg-[#f0f0f2] dark:bg-[#141417]';
  }
  .row {
    --at-apply: 'flex flex-col gap-0.5 px-3 py-2 rounded-md b-1 b-solid b-black/10 dark:b-white/12 hover:b-svp-primary/50';
  }
  .stage {
    --at-apply: 'flex flex-col gap-2 px-6 py-8 sm:px-10 sm:py-12 bg-[#ececee] dark:bg-[#141417]';
  }
  .kicker {
    --at-apply: 'text-[11px] font-600 text-zinc-5 dark:text-zinc-4';
  }
  .title {
    --at-apply: 'text-[15px] font-700 text-svp-primary-deep dark:text-svp-primary';
  }
  .stage .title {
    --at-apply: 'text-[28px] sm:text-[36px] tracking-[-0.03em] leading-none';
  }
  .hint {
    --at-apply: 'text-[12px] text-zinc-5 dark:text-zinc-4';
  }
  .stage .hint {
    --at-apply: 'text-[14px] max-w-[40rem] leading-6';
  }
</style>
