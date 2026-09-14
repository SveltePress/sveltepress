<script lang="ts">
  import type { LeafInfo, VariantKey } from './entries'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { DEMO_LEAVES, VARIANT_KEYS, VARIANT_NAMES } from './entries'

  interface Props {
    variant: VariantKey
    leaf: LeafInfo
  }

  const { variant, leaf }: Props = $props()

  const index = $derived(VARIANT_KEYS.indexOf(variant))

  function hrefFor(next: VariantKey, pathname = page.url.pathname) {
    const params = new URLSearchParams(page.url.searchParams)
    params.set('variant', next)
    const query = params.toString()
    return `${pathname}${query ? `?${query}` : ''}`
  }

  async function cycle(step: number) {
    const next =
      VARIANT_KEYS[(index + step + VARIANT_KEYS.length) % VARIANT_KEYS.length]
    await goto(hrefFor(next), {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    })
  }

  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null
    if (target?.closest('input, textarea, [contenteditable="true"]')) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      void cycle(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      void cycle(1)
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div
  class="bar"
  data-svp-proto-switcher
  role="region"
  aria-label="Open in Playground prototype switcher"
>
  <div class="row">
    <button
      type="button"
      class="arrow"
      aria-label="Previous variant"
      onclick={() => cycle(-1)}
    >
      ←
    </button>
    <div class="label">
      <span class="key">{variant}</span>
      <span class="name">{VARIANT_NAMES[variant]}</span>
    </div>
    <button
      type="button"
      class="arrow"
      aria-label="Next variant"
      onclick={() => cycle(1)}
    >
      →
    </button>
  </div>
  <p class="state">
    {#if leaf.historical}
      Frozen version — no Open in Playground
    {:else if leaf.kind === 'not-an-entry'}
      Not an Entry — control hidden
    {:else}
      {leaf.kind === 'guide-entry' ? 'Guide' : 'Reference'} Entry · {leaf.name}
    {/if}
  </p>
  <nav class="leaves" aria-label="Prototype sample leaves">
    {#each DEMO_LEAVES as demo}
      <a href={hrefFor(variant, demo.href)}>{demo.label}</a>
    {/each}
  </nav>
</div>

<style>
  .bar {
    --at-apply: 'fixed z-950 left-1/2 bottom-3 -translate-x-1/2 w-[min(92vw,28rem)] rounded-2xl px-3 py-2.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]';
    background: #111113;
  }
  .row {
    --at-apply: 'flex items-center gap-2';
  }
  .arrow {
    --at-apply: 'w-8 h-8 rounded-full bg-white/10 hover:bg-white/18 cursor-pointer b-0 text-white text-4';
  }
  .label {
    --at-apply: 'flex-grow min-w-0 text-center leading-tight';
  }
  .key {
    --at-apply: 'font-700 tracking-wide';
  }
  .name {
    --at-apply: 'block text-[12px] text-white/70 truncate';
  }
  .state {
    --at-apply: 'm-0 mt-1.5 text-center text-[11px] text-white/55';
  }
  .leaves {
    --at-apply: 'flex justify-center gap-3 mt-1.5 text-[11px]';
  }
  .leaves a {
    --at-apply: 'text-rose-3 underline-offset-2 hover:underline';
  }
</style>
