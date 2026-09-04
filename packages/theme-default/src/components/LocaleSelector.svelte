<script lang="ts">
  import type { LocaleSwitchTarget } from '@sveltepress/vite'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { tick } from 'svelte'
  import {
    locales,
    resolveLocale,
    resolveLocaleSwitch,
  } from 'virtual:sveltepress/locale'
  import { resolveLocaleOptions } from './locale'
  import { getPathFromBase, inViewHeadingHash, withSwitchSuffix } from './utils'
  import { nextVersionMenuIndex } from './versioning'

  let { mobile = false }: { mobile?: boolean } = $props()
  let open = $state(false)
  let activeIndex = $state(0)
  let menu = $state<HTMLDivElement>()
  let trigger = $state<HTMLButtonElement>()

  const locale = $derived(resolveLocale(page.url.pathname))
  const localeEntries = $derived(Object.entries(locales ?? {}))
  const label = $derived(locale?.label ?? '')
  const selectorLabel = $derived(
    resolveLocaleOptions(page.url.pathname).i18n?.localeSwitcher ?? 'Language',
  )

  async function openMenu() {
    open = true
    activeIndex = Math.max(
      0,
      localeEntries.findIndex(([prefix]) => prefix === locale?.prefix),
    )
    await tick()
    const items = menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    items?.[activeIndex]?.focus()
  }

  function closeMenu() {
    open = false
  }

  function handleButtonKeydown(event: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      openMenu()
    }
  }

  function handleMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
      trigger?.focus()
      return
    }
    const next = nextVersionMenuIndex(
      activeIndex,
      event.key,
      localeEntries.length,
    )
    if (next !== activeIndex) {
      event.preventDefault()
      activeIndex = next
      const items =
        menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
      items?.[activeIndex]?.focus()
    }
  }

  function handleFocusOut(event: FocusEvent) {
    if (
      !(event.currentTarget as HTMLElement | null)?.contains(
        event.relatedTarget as Node | null,
      )
    ) {
      closeMenu()
    }
  }

  function switchPath() {
    const hash = page.url.hash || inViewHeadingHash()
    return `${page.url.pathname}${page.url.search}${hash}`
  }

  async function selectLocale(target: LocaleSwitchTarget | null) {
    if (!target) return
    closeMenu()
    const href = withSwitchSuffix(
      target.href,
      '',
      target.fallback,
      'svp-locale-fallback',
    )
    await goto(getPathFromBase(href))
  }
</script>

{#if locales}
  <div class:mobile class="locale-selector" onfocusout={handleFocusOut}>
    <button
      bind:this={trigger}
      type="button"
      class="locale-trigger"
      aria-label={selectorLabel}
      aria-haspopup="menu"
      aria-expanded={open}
      onclick={() => (open ? closeMenu() : openMenu())}
      onkeydown={handleButtonKeydown}
    >
      <span>{label}</span>
      <span aria-hidden="true" class:open>▾</span>
    </button>
    {#if open}
      <div
        bind:this={menu}
        class="locale-menu"
        role="menu"
        tabindex="-1"
        aria-label={selectorLabel}
        onkeydown={handleMenuKeydown}
      >
        {#each localeEntries as [prefix, entry], index}
          <button
            type="button"
            role="menuitem"
            class:active={prefix === locale?.prefix}
            tabindex={index === activeIndex ? 0 : -1}
            onclick={() =>
              selectLocale(resolveLocaleSwitch(switchPath(), prefix))}
          >
            <span class="locale-option-label">{entry.label}</span>
            {#if prefix === locale?.prefix}<span aria-hidden="true">✓</span
              >{/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .locale-selector {
    --at-apply: 'relative hidden sm:flex items-center';
  }
  .locale-selector.mobile {
    --at-apply: 'px-4 py-2';
    display: flex;
  }
  .locale-trigger {
    --at-apply: 'bg-transparent b-0 px-3 py-2 text-sm font-600 text-zinc-7 dark:text-zinc-2 cursor-pointer flex items-center gap-1 rounded hover:bg-black/4 dark:hover:bg-white/6';
  }
  .mobile .locale-trigger {
    --at-apply: 'w-full justify-between b-1 b-solid b-black/8 dark:b-white/8';
  }
  .locale-trigger .open {
    transform: rotate(180deg);
  }
  .locale-menu {
    --at-apply: 'absolute top-[calc(100%-8px)] right-0 min-w-36 bg-white dark:bg-zinc-8 rounded-md shadow-lg b-1 b-solid b-black/8 dark:b-white/8 p-1 z-999';
  }
  .mobile .locale-menu {
    --at-apply: 'top-full left-4 right-4';
  }
  .locale-menu button {
    --at-apply: 'w-full b-0 bg-transparent text-left px-3 py-2 rounded flex items-center justify-between gap-2 cursor-pointer text-zinc-7 dark:text-zinc-2 hover:bg-black/5 dark:hover:bg-white/7';
  }
  .locale-menu button.active {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary font-600';
  }
</style>
