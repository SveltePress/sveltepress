<script>
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { tick } from 'svelte'
  import siteConfig from 'virtual:sveltepress/site'
  import {
    resolveVersionChanges,
    resolveVersionContext,
    resolveVersionManifest,
  } from 'virtual:sveltepress/versions'
  import EditPage from './EditPage.svelte'
  import Home from './Home.svelte'
  import HeroCode from './home/HeroCode.svelte'
  import HeroImage from './home/HeroImage.svelte'
  import LastUpdate from './LastUpdate.svelte'
  import { anchors, pages, showHeader, showLayout, sidebar } from './layout'
  import { resolveLocaleOptions, resolveLogicalRoute } from './locale'
  import PageSwitcher from './PageSwitcher.svelte'

  const versionContext = $derived(resolveVersionContext(page.url.pathname))
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const versionChanges = $derived(
    resolveVersionChanges(versionContext?.versionId, page.url.pathname),
  )
  const newPage = $derived(
    versionChanges?.newPages.find(
      changedPage => changedPage.route === versionContext?.logicalPath,
    ),
  )
  const newPageLabel = $derived(
    (localeOptions.i18n?.versionNewLabel ?? 'New in {version}').replace(
      '{version}',
      versionContext?.version.label ?? versionContext?.versionId ?? '',
    ),
  )
  const canonical = $derived(
    resolveVersionManifest(page.url.pathname) ? page.url.pathname : null,
  )
  const noIndex = $derived.by(() => {
    if (!versionContext?.historical) return false
    return (
      versionContext.version.status === 'eol' &&
      versionContext.version.noIndex !== false
    )
  })

  // The frontmatter info. This would be injected by sveltepress
  const { fm, children, heroImage } = $props()

  const {
    pageType,
    lastUpdate,
    anchors: fmAnchors = [],
    sidebar: fmSidebar = true,
    home,
    heroImage: fmHeroImage,
    header = true,
    layout = true,
  } = fm

  function resolveHomeLayout() {
    const logical = resolveLogicalRoute(page.route.id)
    return (
      ((versionContext?.logicalPath ?? logical) === '/' && home !== false) ||
      home === true
    )
  }

  const isHome = $derived(resolveHomeLayout())

  $sidebar = resolveHomeLayout() ? false : fmSidebar
  $showHeader = header
  $showLayout = layout

  anchors.set(resolveHomeLayout() ? [] : fmAnchors)

  let ready = $state(false)

  beforeNavigate(() => {
    ready = false
  })

  afterNavigate(() => {
    tick().then(() => {
      ready = true
    })
  })
</script>

<svelte:head>
  <title
    >{fm.title ? `${fm.title} - ${siteConfig.title}` : siteConfig.title}</title
  >
  <meta name="description" content={fm.description || siteConfig.description} />
  {#if canonical}<link rel="canonical" href={canonical} />{/if}
  {#if noIndex}<meta name="robots" content="noindex,follow" />{/if}
</svelte:head>

{#if layout === false}
  {@render children?.()}
{:else}
  {#snippet defaultHeroImage()}
    {#if fmHeroImage}
      <HeroImage heroImage={fmHeroImage} />
    {:else}
      <HeroCode {...localeOptions.i18n?.heroCode} />
    {/if}
  {/snippet}
  {#if !isHome}
    <div pb-4 class="theme-default--page-layout">
      <div
        class="content"
        data-pagefind-body={!versionContext?.historical ? true : undefined}
      >
        {#if fm.title}
          <h1 class="page-title">
            {fm.title}
            {#if newPage}<span
                class="version-new-badge ml-2 inline-flex align-middle items-center rounded-full bg-rose-50 dark:bg-rose-950/45 px-2.5 py-1 text-xs font-700 text-svp-primary-deep dark:text-svp-primary"
                >{newPageLabel}</span
              >{/if}
          </h1>
        {/if}
        {@render children?.()}
        <div class="meta" class:without-edit-link={!localeOptions.editLink}>
          {#if localeOptions.editLink}
            <EditPage {pageType} />
          {/if}
          <LastUpdate {lastUpdate} />
        </div>
        {#if ready && $pages.length}
          <PageSwitcher />
        {/if}
      </div>
    </div>
  {:else if home !== false}
    <Home
      {...fm}
      {siteConfig}
      heroImage={fmHeroImage === false
        ? undefined
        : (heroImage ?? defaultHeroImage)}
      {children}
    ></Home>
  {/if}
{/if}

<style>
  :global(.theme-default--page-layout h1 .svp-title-anchor),
  :global(.theme-default--page-layout h2 .svp-title-anchor),
  :global(.theme-default--page-layout h3 .svp-title-anchor),
  :global(.theme-default--page-layout h4 .svp-title-anchor),
  :global(.theme-default--page-layout h5 .svp-title-anchor),
  :global(.theme-default--page-layout h6 .svp-title-anchor) {
    --at-apply: 'absolute left-0 top-[50%] flex items-center opacity-0 pointer-events-none hover:text-svp-hover transition-all transition-200';
    transform: translate(-100%, -50%);
  }

  :global(.theme-default--page-layout h2 .svp-title-anchor) {
    transform: translate(-100%, calc((-100% + 1.5rem) / 2));
  }
  :global(.theme-default--page-layout h1),
  :global(.theme-default--page-layout h2),
  :global(.theme-default--page-layout h3),
  :global(.theme-default--page-layout h4),
  :global(.theme-default--page-layout h5),
  :global(.theme-default--page-layout h6) {
    --at-apply: 'relative';
  }
  :global(.theme-default--page-layout h1) {
    --at-apply: 'text-8 leading-[1.3] font-700 tracking-[-0.02em] mb-5';
  }
  :global(.theme-default--page-layout h2) {
    --at-apply: 'text-6 leading-[1.35] font-600 tracking-[-0.01em] border-t-solid border-t border-black/8 dark:border-white/10 pt-6 mt-12 mb-4';
  }
  :global(.theme-default--page-layout h3) {
    --at-apply: 'text-5 leading-[1.4] font-600 mt-8 mb-3';
  }
  :global(.theme-default--page-layout h4) {
    --at-apply: 'text-4.5 leading-[1.4] font-600 mt-6 mb-2';
  }
  :global(.theme-default--page-layout h1:hover .svp-title-anchor),
  :global(.theme-default--page-layout h2:hover .svp-title-anchor),
  :global(.theme-default--page-layout h3:hover .svp-title-anchor),
  :global(.theme-default--page-layout h4:hover .svp-title-anchor),
  :global(.theme-default--page-layout h5:hover .svp-title-anchor),
  :global(.theme-default--page-layout h6:hover .svp-title-anchor) {
    --at-apply: 'pointer-events-auto opacity-100';
  }
  :global(.theme-default--page-layout img) {
    --at-apply: 'max-w-full';
  }
  .content {
    --at-apply: 'sm:w-[45vw] max-w-[780px] mx-auto pb-8 sm:pb-28 w-[90vw]';
  }
  .page-title {
    --at-apply: 'mt-none';
  }
  .meta {
    --at-apply: 'sm:flex justify-between mt-16 column';
  }
  .without-edit-link {
    --at-apply: 'justify-end';
  }
</style>
