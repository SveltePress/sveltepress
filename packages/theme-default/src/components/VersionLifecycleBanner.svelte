<script>
  import { page } from '$app/state'
  import { manifest } from 'virtual:sveltepress/versions'
  import Link from './Link.svelte'
  import { resolveLocaleOptions } from './locale'
  import { getLifecycleBanner } from './versioning'

  const defaultOldVersionMessage =
    'You are viewing an older version of this site. Some features may not work as expected.'
  const banner = $derived(getLifecycleBanner(page.url.pathname, manifest))
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const defaultMessage = $derived(
    banner?.status === 'eol'
      ? (localeOptions.i18n?.versionEol ?? defaultOldVersionMessage)
      : (localeOptions.i18n?.versionDeprecated ?? defaultOldVersionMessage),
  )
  const currentLabel = $derived(
    localeOptions.i18n?.versionViewCurrent ?? 'Current version',
  )
  const statusLabel = $derived(
    banner?.status === 'eol'
      ? (localeOptions.i18n?.versionEolLabel ?? 'EOL')
      : (localeOptions.i18n?.versionDeprecatedLabel ?? 'Deprecated'),
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
    --at-apply: 'flex-none gap-1 px-1 py-1 leading-4 font-700 text-amber-950 no-underline hover:text-amber-950';
    white-space: nowrap;
    border-bottom: 1px solid color-mix(in srgb, currentColor 45%, transparent);
  }
  .version-lifecycle :global(.link)::after {
    content: '→';
    transition: transform 0.2s ease;
  }
  .version-lifecycle :global(.link):hover::after {
    transform: translateX(2px);
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
