<script>
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { resolveLocaleOptions } from './locale'

  let show = $state(false)
  const defaultMessage =
    'This page is not available in the selected documentation version. You are viewing that version’s home page instead.'
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const message = $derived(
    localeOptions.i18n?.versionPageUnavailable ?? defaultMessage,
  )

  afterNavigate(() => {
    const fallback = new URL(window.location.href).searchParams.get(
      'svp-version-fallback',
    )
    show = fallback === '1'
  })
</script>

{#if show}
  <div class="version-fallback" role="status">{message}</div>
{/if}

<style>
  .version-fallback {
    --at-apply: 'mx-auto mb-4 max-w-[1120px] box-border rounded-md b-1 b-solid b-amber-500/40 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200';
  }
  @media (min-width: 950px) {
    .version-fallback {
      max-width: none;
      margin-left: calc(max(0px, (100vw - 1440px) / 2) + min(25vw, 288px));
      margin-right: max(24px, calc((100vw - 1440px) / 2 + 24px));
    }
  }
</style>
