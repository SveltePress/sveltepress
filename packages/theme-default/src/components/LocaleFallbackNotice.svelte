<script>
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { locales } from 'virtual:sveltepress/locale'
  import { resolveLocaleOptions } from './locale'

  let show = $state(false)
  const defaultMessage =
    'This page is not available in this language. You are viewing that language’s home page instead.'
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const message = $derived(
    localeOptions.i18n?.localePageUnavailable ?? defaultMessage,
  )

  function dismiss() {
    show = false
  }

  afterNavigate(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const fallback = url.searchParams.get('svp-locale-fallback')
    if (locales !== null && fallback === '1') {
      show = true
      url.searchParams.delete('svp-locale-fallback')
      const cleanUrl = url.pathname + (url.search ? url.search : '') + url.hash
      window.history.replaceState(window.history.state, '', cleanUrl)
    } else {
      show = false
    }
  })
</script>

{#if show}
  <div class="locale-fallback" role="status">
    <span>{message}</span>
    <button
      type="button"
      class="locale-fallback-close"
      aria-label="Close"
      onclick={dismiss}
    >
      ✕
    </button>
  </div>
{/if}

<style>
  .locale-fallback {
    --at-apply: 'mx-auto mb-4 max-w-[1120px] box-border rounded-md b-1 b-solid b-amber-500/40 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3';
  }
  .locale-fallback-close {
    --at-apply: 'bg-transparent b-0 p-1 cursor-pointer text-amber-900/60 dark:text-amber-200/60 hover:text-amber-900 dark:hover:text-amber-200 flex items-center justify-center rounded leading-none text-base';
  }
  @media (min-width: 950px) {
    .locale-fallback {
      max-width: none;
      margin-left: calc(max(0px, (100vw - 1440px) / 2) + min(25vw, 288px));
      margin-right: max(24px, calc((100vw - 1440px) / 2 + 24px));
    }
  }
</style>
