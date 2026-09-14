<script lang="ts">
  import type { BootState } from './_prototype'
  import { dev } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import {
    currentVariant,
    prototypeBoot,
    prototypeView,
    variantHref,
    VARIANTS,
  } from './_prototype'

  const variant = $derived(currentVariant(page.url))
  const variantIndex = $derived(
    VARIANTS.findIndex(item => item.key === variant),
  )
  const boot = $derived(
    (page.url.searchParams.get('boot') as BootState | null) ?? 'ready',
  )
  const view = $derived(
    page.url.pathname.replace(/\/+$/, '').endsWith('/prototype/playground')
      ? 'home'
      : 'entry',
  )

  $effect(() => {
    prototypeBoot.set(boot)
    prototypeView.set(view)
  })

  function cycle(delta: number) {
    const next =
      VARIANTS[(variantIndex + delta + VARIANTS.length) % VARIANTS.length]
    void goto(variantHref(next.key, page.url), {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    })
  }

  function setBoot(next: BootState) {
    const params = new URLSearchParams(page.url.searchParams)
    if (next === 'ready') params.delete('boot')
    else params.set('boot', next)
    const query = params.toString()
    void goto(query ? `${page.url.pathname}?${query}` : page.url.pathname, {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    })
  }

  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null
    if (
      target &&
      target.closest('input, textarea, select, [contenteditable="true"]')
    ) {
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      cycle(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      cycle(1)
    }
  }
</script>

<svelte:window onkeydown={onKey} />

{#if dev}
  <div class="bar" data-pagefind-ignore="all">
    <button
      type="button"
      class="arrow"
      aria-label="Previous variant"
      onclick={() => cycle(-1)}>←</button
    >
    <div class="label">
      {variant} — {VARIANTS[variantIndex].name}
    </div>
    <button
      type="button"
      class="arrow"
      aria-label="Next variant"
      onclick={() => cycle(1)}>→</button
    >
    <div class="boots" role="group" aria-label="Hosted editor boot state">
      {#each ['loading', 'ready', 'failed'] as state}
        <button
          type="button"
          class="boot"
          class:on={boot === state}
          onclick={() => setBoot(state as BootState)}>{state}</button
        >
      {/each}
    </div>
    <pre class="dump">view={view} variant={variant} boot={boot}</pre>
  </div>
{/if}

<style>
  .bar {
    --at-apply: 'fixed bottom-4 left-4 z-999 flex flex-wrap items-center gap-2 px-3 py-2 rounded-full bg-[#18181b] text-zinc-1 shadow-lg';
    max-width: calc(100vw - 2rem);
  }
  .arrow,
  .boot {
    --at-apply: 'bg-white/10 b-none text-zinc-1 rounded-full px-2.5 h-8 cursor-pointer font-600';
  }
  .boot.on {
    --at-apply: 'bg-svp-primary text-[#18181b]';
  }
  .label {
    --at-apply: 'text-[12px] font-600 whitespace-nowrap';
  }
  .boots {
    --at-apply: 'flex gap-1';
  }
  .dump {
    --at-apply: 'm-0 text-[11px] font-mono text-zinc-4 px-2';
  }
</style>
