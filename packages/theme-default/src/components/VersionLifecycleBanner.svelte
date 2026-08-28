<script>
  import { page } from '$app/state'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { manifest } from 'virtual:sveltepress/versions'
  import Link from './Link.svelte'
  import { getLifecycleBanner } from './versioning'

  const defaultEolMessage =
    'This documentation version has reached end of life and is no longer supported.'
  const defaultDeprecatedMessage =
    'This documentation version is deprecated and may no longer receive updates.'
  const banner = $derived(getLifecycleBanner(page.url.pathname, manifest))
  const defaultMessage = $derived(
    banner?.status === 'eol'
      ? (themeOptions.i18n?.versionEol ?? defaultEolMessage)
      : (themeOptions.i18n?.versionDeprecated ?? defaultDeprecatedMessage),
  )
  const currentLabel = $derived(
    themeOptions.i18n?.versionViewCurrent ?? 'View current documentation',
  )
  const statusLabel = $derived(
    banner?.status === 'eol'
      ? (themeOptions.i18n?.versionEolLabel ?? 'EOL')
      : (themeOptions.i18n?.versionDeprecatedLabel ?? 'Deprecated'),
  )
</script>

{#if banner}
  <aside
    class:eol={banner.status === 'eol'}
    class="version-lifecycle"
    aria-label={statusLabel}
  >
    <div>
      <strong>{statusLabel}</strong>
      <span>{banner.message ?? defaultMessage}</span>
    </div>
    <Link to={banner.target} label={currentLabel} withVersion={false} />
  </aside>
{/if}

<style>
  .version-lifecycle {
    --at-apply: 'mx-auto mb-4 max-w-[1120px] box-border rounded-md b-1 b-solid b-amber-500/45 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between';
  }
  .version-lifecycle.eol {
    --at-apply: 'b-red-500/45 bg-red-50 dark:bg-red-950/30 text-red-950 dark:text-red-100';
  }
  .version-lifecycle div {
    --at-apply: 'flex flex-col gap-1';
  }
  @media (min-width: 950px) {
    .version-lifecycle {
      max-width: none;
      margin-left: calc(max(0px, (100vw - 1440px) / 2) + min(25vw, 288px));
      margin-right: max(24px, calc((100vw - 1440px) / 2 + 24px));
    }
  }
</style>
