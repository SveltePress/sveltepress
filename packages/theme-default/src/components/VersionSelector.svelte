<script lang="ts">
  import type { VersionSwitchTarget } from '@sveltepress/vite/versioning'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { tick } from 'svelte'
  import {
    resolveVersionContext,
    resolveVersionManifest,
    resolveVersionSwitch,
  } from 'virtual:sveltepress/versions'
  import { resolveLocaleOptions } from './locale'
  import { getPathFromBase, withSwitchSuffix } from './utils'
  import { getVersionOptions, nextVersionMenuIndex } from './versioning'

  let { mobile = false }: { mobile?: boolean } = $props()
  let open = $state(false)
  let activeIndex = $state(0)
  let menu = $state<HTMLDivElement>()
  let trigger = $state<HTMLButtonElement>()

  const context = $derived(resolveVersionContext(page.url.pathname))
  const options = $derived(
    getVersionOptions(
      page.url.pathname,
      resolveVersionManifest(page.url.pathname),
      resolveVersionSwitch,
    ),
  )
  const currentManifest = $derived(resolveVersionManifest(page.url.pathname))
  const label = $derived(
    context?.version.label ?? currentManifest?.current.label ?? '',
  )
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const selectorLabel = $derived(
    localeOptions.i18n?.versionSelector ?? 'Documentation version',
  )

  function statusLabel(status: string | undefined) {
    if (status === 'deprecated')
      return localeOptions.i18n?.versionDeprecatedLabel ?? 'Deprecated'
    if (status === 'eol') return localeOptions.i18n?.versionEolLabel ?? 'EOL'
    return ''
  }

  async function openMenu() {
    open = true
    activeIndex = Math.max(
      0,
      options.findIndex(option => option.id === context?.versionId),
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
    const next = nextVersionMenuIndex(activeIndex, event.key, options.length)
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

  async function selectVersion(target: VersionSwitchTarget | null) {
    if (!target) return
    closeMenu()
    const href = withSwitchSuffix(
      target.href,
      page.url.hash,
      target.fallback,
      'svp-version-fallback',
    )
    await goto(getPathFromBase(href))
  }
</script>

{#if resolveVersionManifest(page.url.pathname)}
  <div class:mobile class="version-selector" onfocusout={handleFocusOut}>
    <button
      bind:this={trigger}
      type="button"
      class="version-trigger"
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
        class="version-menu"
        role="menu"
        tabindex="-1"
        aria-label={selectorLabel}
        onkeydown={handleMenuKeydown}
      >
        {#each options as option, index}
          <button
            type="button"
            role="menuitem"
            class:active={option.id === context?.versionId}
            tabindex={index === activeIndex ? 0 : -1}
            onclick={() => selectVersion(option.target)}
          >
            <span
              class="version-option-label"
              style="white-space: nowrap; flex-shrink: 0">{option.label}</span
            >
            {#if statusLabel(option.status)}<small class="version-status-badge"
                >{statusLabel(option.status)}</small
              >{/if}
            {#if option.id === context?.versionId}<span aria-hidden="true"
                >✓</span
              >{/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .version-selector {
    --at-apply: 'relative hidden sm:flex items-center';
  }
  .version-selector.mobile {
    --at-apply: 'px-4 py-2';
    display: flex;
  }
  .version-trigger {
    --at-apply: 'bg-transparent b-0 px-3 py-2 text-sm font-600 text-zinc-7 dark:text-zinc-2 cursor-pointer flex items-center gap-1 rounded hover:bg-black/4 dark:hover:bg-white/6';
  }
  .mobile .version-trigger {
    --at-apply: 'w-full justify-between b-1 b-solid b-black/8 dark:b-white/8';
  }
  .version-trigger .open {
    transform: rotate(180deg);
  }
  .version-menu {
    --at-apply: 'absolute top-[calc(100%-8px)] right-0 min-w-52 bg-white dark:bg-zinc-8 rounded-md shadow-lg b-1 b-solid b-black/8 dark:b-white/8 p-1 z-999';
  }
  .mobile .version-menu {
    --at-apply: 'top-full left-4 right-4';
  }
  .version-menu button {
    --at-apply: 'w-full b-0 bg-transparent text-left px-3 py-2 rounded flex items-center justify-between gap-2 cursor-pointer text-zinc-7 dark:text-zinc-2 hover:bg-black/5 dark:hover:bg-white/7';
  }
  .version-menu button.active {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary font-600';
  }
  .version-status-badge {
    white-space: nowrap;
    --at-apply: 'ml-auto rounded-full bg-black/6 dark:bg-white/10 px-2 py-1 text-[10px] leading-none uppercase tracking-wide text-zinc-500 dark:text-zinc-300';
  }
</style>
