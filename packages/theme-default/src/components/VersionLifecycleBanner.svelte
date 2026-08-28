<script>
  import { page } from '$app/state'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { manifest } from 'virtual:sveltepress/versions'
  import Link from './Link.svelte'
  import { getLifecycleBanner } from './versioning'

  const defaultOldVersionMessage =
    'You are viewing an older version of this site. Some features may not work as expected.'
  const banner = $derived(getLifecycleBanner(page.url.pathname, manifest))
  const defaultMessage = $derived(
    banner?.status === 'eol'
      ? (themeOptions.i18n?.versionEol ?? defaultOldVersionMessage)
      : (themeOptions.i18n?.versionDeprecated ?? defaultOldVersionMessage),
  )
  const currentLabel = $derived(
    themeOptions.i18n?.versionViewCurrent ?? 'Switch to the current version',
  )
  const statusLabel = $derived(
    banner?.status === 'eol'
      ? (themeOptions.i18n?.versionEolLabel ?? 'EOL')
      : (themeOptions.i18n?.versionDeprecatedLabel ?? 'Deprecated'),
  )
</script>

{#if banner}
  <aside
    role="status"
    class:eol={banner.status === 'eol'}
    class="version-lifecycle"
    aria-label={statusLabel}
  >
    <div class="lifecycle-message">
      <strong>{statusLabel}</strong>
      <span>{banner.message ?? defaultMessage}</span>
    </div>
    <Link to={banner.target} label={currentLabel} withVersion={false} />
  </aside>
{/if}

<style>
  .version-lifecycle {
    --at-apply: 'fixed top-0 left-0 right-0 z-1100 box-border bg-amber-400 dark:bg-amber-500 px-3 sm:px-5 text-xs sm:text-sm font-500 text-amber-950 flex items-center justify-between gap-3 shadow-sm';
    height: var(--svp-lifecycle-banner-height, 96px);
  }
  .version-lifecycle.eol {
    --at-apply: 'bg-red-500 dark:bg-red-600 text-white';
  }
  .lifecycle-message {
    --at-apply: 'min-w-0 flex items-center gap-2 sm:gap-3';
  }
  .lifecycle-message strong {
    --at-apply: 'hidden sm:block flex-none rounded-full bg-black/10 dark:bg-black/20 px-2 py-1 text-[10px] sm:text-xs uppercase tracking-wide';
  }
  .lifecycle-message span {
    --at-apply: 'leading-4 sm:leading-5';
  }
  .version-lifecycle :global(.link) {
    --at-apply: 'flex-none max-w-36 justify-center rounded-lg sm:rounded-full bg-black/15 dark:bg-black/25 px-3 py-2 sm:py-1.5 text-center leading-4 font-700 text-amber-950 no-underline hover:bg-black/20 hover:text-amber-950 dark:hover:bg-black/35';
  }
  .version-lifecycle.eol :global(.link) {
    --at-apply: 'text-white hover:text-white';
  }
  :global(body:has(.version-lifecycle)) {
    --svp-lifecycle-banner-height: 96px;
  }
  :global(body:has(.version-lifecycle) .header),
  :global(body:has(.version-lifecycle) .theme-default-sidebar) {
    top: var(--svp-lifecycle-banner-height);
  }
  :global(body:has(.version-lifecycle) .toc) {
    top: var(--svp-lifecycle-banner-height);
  }
  :global(body:has(.version-lifecycle) .navbar-mobile) {
    top: calc(56px + var(--svp-lifecycle-banner-height));
    max-height: calc(100vh - 56px - var(--svp-lifecycle-banner-height));
  }
  :global(body:has(.version-lifecycle) main) {
    padding-top: calc(56px + var(--svp-lifecycle-banner-height));
  }
  :global(body:has(.version-lifecycle) main.with-mobile-subnav) {
    padding-top: calc(100px + var(--svp-lifecycle-banner-height));
  }
  :global(body:has(.version-lifecycle) main.without-header) {
    padding-top: var(--svp-lifecycle-banner-height);
  }
  @media (min-width: 950px) {
    :global(body:has(.version-lifecycle)) {
      --svp-lifecycle-banner-height: 48px;
    }
    :global(body:has(.version-lifecycle) .toc) {
      top: calc(80px + var(--svp-lifecycle-banner-height));
    }
    :global(body:has(.version-lifecycle) .navbar-mobile) {
      top: calc(73px + var(--svp-lifecycle-banner-height));
      max-height: calc(100vh - 73px - var(--svp-lifecycle-banner-height));
    }
    :global(body:has(.version-lifecycle) main),
    :global(body:has(.version-lifecycle) main.with-mobile-subnav) {
      padding-top: calc(73px + var(--svp-lifecycle-banner-height));
    }
    :global(body:has(.version-lifecycle) main.without-header) {
      padding-top: var(--svp-lifecycle-banner-height);
    }
  }
</style>
