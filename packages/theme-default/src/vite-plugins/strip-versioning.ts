/* eslint-disable no-template-curly-in-string */
import { basename } from 'node:path'

type SourceTransform = (source: string) => string

function replaceRequired(source: string, search: string, replacement = ''): string {
  if (!source.includes(search))
    throw new Error(`[@sveltepress/default-theme] Cannot preserve the no-manifest bundle because a versioning transform anchor changed: ${search.slice(0, 80)}`)
  return source.replace(search, replacement)
}

const transforms: Record<string, SourceTransform> = {
  'ActionButton.svelte': (source) => {
    let result = replaceRequired(source, `  import {\n    resolveVersionContext,\n    resolveVersionedPath,\n  } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const resolvedTo = $derived(\n    external\n      ? to\n      : resolveVersionedPath(\n          resolveLocaleLink(to, page.url.pathname),\n          versionContext,\n        ),\n  )`, `  const resolvedTo = $derived(\n    external ? to : resolveLocaleLink(to, page.url.pathname),\n  )`)
    return result
  },
  'EditPage.svelte': (source) => {
    let result = replaceRequired(source, `  import { resolveHistoricalEditLink } from 'virtual:sveltepress/theme-default/versioning'\n  import { resolveVersionManifest } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, '  const routeId = $derived(page.route.id)', '  const routeId = page.route.id')
    result = replaceRequired(result, `  const resolvedEditLink = $derived(\n    resolveHistoricalEditLink(\n      localeOptions.editLink,\n      routeId,\n      pageType,\n      resolveVersionManifest(page.url.pathname),\n    ),\n  )\n\n`, '\n')
    result = replaceRequired(result, `  function handleEditLinkClick() {\n    if (resolvedEditLink) window.open(resolvedEditLink, '_blank')\n  }`, `  function handleEditLinkClick() {\n    if (localeOptions.editLink) {\n      window.open(\n        localeOptions.editLink.replace(':route', \`${'${routeId}'}/+page.${'${pageType}'}\`),\n        '_blank',\n      )\n    }\n  }`)
    return replaceRequired(result, `{#if resolvedEditLink}\n  <div\n    class="edit-link"\n    onclick={handleEditLinkClick}\n    onkeyup={handleEditLinkClick}\n    role="link"\n    tabindex="0"\n  >\n    <div class="edit-icon">\n      <Edit />\n    </div>\n    <div class="edit-text">\n      {localeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT}\n    </div>\n  </div>\n{/if}`, `<div\n  class="edit-link"\n  onclick={handleEditLinkClick}\n  onkeyup={handleEditLinkClick}\n  role="link"\n  tabindex="0"\n>\n  <div class="edit-icon">\n    <Edit />\n  </div>\n  <div class="edit-text">\n    {localeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT}\n  </div>\n</div>`)
  },
  'GlobalLayout.svelte': (source) => {
    let result = replaceRequired(source, `  import { onMount, setContext, tick } from 'svelte'`, `  import { onMount, setContext } from 'svelte'`)
    result = replaceRequired(result, `  import VersionFallbackNotice from 'virtual:sveltepress/theme-default/VersionFallbackNotice.svelte'\n  import VersionLifecycleBanner from 'virtual:sveltepress/theme-default/VersionLifecycleBanner.svelte'\n`)
    result = replaceRequired(result, `  import {\n    resolveVersionContext,\n    resolveVersionManifest,\n  } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, `  import { updateVersionChangeBadges } from './version-change-badges'\n`)
    result = replaceRequired(result, `\n  function refreshVersionChangeBadges() {\n    const context = resolveVersionContext(page.url.pathname)\n    updateVersionChangeBadges(document, context?.version)\n  }\n`)
    result = replaceRequired(result, '    resolveSidebar(page.route.id)\n    $sidebarCollapsed', '    $sidebarCollapsed')
    result = replaceRequired(result, `    tick().then(refreshVersionChangeBadges)\n`)
    result = replaceRequired(result, `    refreshVersionChangeBadges()\n`)
    result = replaceRequired(result, `{#if resolveVersionManifest(page.url.pathname)}\n  <VersionLifecycleBanner />\n{/if}\n`)
    return replaceRequired(result, `    {#if resolveVersionManifest(page.url.pathname)}\n      <VersionFallbackNotice />\n    {/if}\n`)
  },
  'Link.svelte': (source) => {
    let result = replaceRequired(source, `  import { page } from '$app/state'\n  import {\n    resolveVersionContext,\n    resolveVersionedPath,\n  } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, '   * @property {boolean} [withVersion] - Whether the active documentation version should be applied\n')
    result = replaceRequired(result, '    withVersion = true,\n')
    result = replaceRequired(result, `  let versionContext = $derived(resolveVersionContext(page.url.pathname))\n  let localizedTo = $derived(\n    withLocale ? resolveLocaleLink(to, page.url.pathname) : to,\n  )\n  let versionedTo = $derived(\n    withVersion\n      ? resolveVersionedPath(localizedTo, versionContext)\n      : localizedTo,\n  )\n  let toWithBase = $derived(isExternal ? to : getPathFromBase(versionedTo))`, '  let toWithBase = $derived(isExternal ? to : getPathFromBase(withLocale ? resolveLocaleLink(to, page.url.pathname) : to))')
    return result
  },
  'Logo.svelte': source => replaceRequired(
    replaceRequired(source, `  import { parseImageSrc } from './utils'`, `  import { getPathFromBase, parseImageSrc } from './utils'`),
    '<NavItem to="/" title={siteConfig.title} brand>',
    '<NavItem to={getPathFromBase(\'/\')} title={siteConfig.title} brand>',
  ),
  'NavItem.svelte': (source) => {
    let result = replaceRequired(source, `  import {\n    resolveVersionContext,\n    resolveVersionedPath,\n  } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const resolvedTo = $derived(\n    external\n      ? to\n      : resolveVersionedPath(\n          resolveLocaleLink(to, page.url.pathname),\n          versionContext,\n        ),\n  )`, `  const resolvedTo = $derived(\n    external ? to : resolveLocaleLink(to, page.url.pathname),\n  )`)
    return result
  },
  'NavbarMobile.svelte': source => replaceRequired(
    replaceRequired(source, `  import VersionSelector from 'virtual:sveltepress/theme-default/VersionSelector.svelte'\n`),
    '    <VersionSelector mobile />\n',
  ),
  'PageLayout.svelte': (source) => {
    let result = replaceRequired(source, `  import {\n    resolveVersionChanges,\n    resolveVersionContext,\n    resolveVersionManifest,\n  } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n  const versionChanges = $derived(\n    resolveVersionChanges(versionContext?.versionId, page.url.pathname),\n  )\n  const newPage = $derived(\n    versionChanges?.newPages.find(\n      changedPage => changedPage.route === versionContext?.logicalPath,\n    ),\n  )\n  const newPageLabel = $derived(\n    (localeOptions.i18n?.versionNewLabel ?? 'New in {version}').replace(\n      '{version}',\n      versionContext?.version.label ?? versionContext?.versionId ?? '',\n    ),\n  )\n  const canonical = $derived(\n    resolveVersionManifest(page.url.pathname) ? page.url.pathname : null,\n  )\n  const noIndex = $derived.by(() => {\n    if (!versionContext?.historical) return false\n    return (\n      versionContext.version.status === 'eol' &&\n      versionContext.version.noIndex !== false\n    )\n  })\n`, `  const routeId = $derived(page.route.id)\n  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n`)
    result = replaceRequired(result, `            {#if newPage}<span\n                class="version-new-badge ml-2 inline-flex align-middle items-center rounded-full bg-rose-50 dark:bg-rose-950/45 px-2.5 py-1 text-xs font-700 text-svp-primary-deep dark:text-svp-primary"\n                >{newPageLabel}</span\n              >{/if}\n`)
    result = replaceRequired(result, `  function resolveHomeLayout() {\n    const logical = resolveLogicalRoute(page.route.id)\n    return (\n      ((versionContext?.logicalPath ?? logical) === '/' && home !== false) ||\n      home === true\n    )\n  }`, `  function resolveHomeLayout() {\n    const logical = resolveLogicalRoute(routeId)\n    return (logical === '/' && home !== false) || home === true\n  }`)
    result = replaceRequired(result, `      <div\n        class="content"\n        data-pagefind-body={!versionContext?.historical ? true : undefined}\n      >`, `      <div class="content" data-pagefind-body>`)
    return replaceRequired(result, `  {#if canonical}<link rel="canonical" href={canonical} />{/if}\n  {#if noIndex}<meta name="robots" content="noindex,follow" />{/if}\n`)
  },
  'layout.ts': (source) => {
    let result = replaceRequired(source, `import { resolveVersionSidebar } from 'virtual:sveltepress/theme-default/versioning'\nimport {\n  resolveVersionChanges,\n  resolveVersionContext,\n  resolveVersionedPath,\n  resolveVersionManifest,\n} from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, `export const changedPageRoutes = writable<Set<string>>(new Set())\n\nexport const changedSectionIds = writable<Set<string>>(new Set())\n\n`)
    result = replaceRequired(result, `  resolveVersionNavigationChanges(routeId)\n`)
    result = replaceRequired(result, `\nfunction resolveVersionNavigationChanges(routeId: string) {\n  const context = resolveVersionContext(routeId)\n  const changes = resolveVersionChanges(context?.versionId, routeId)\n  if (!context || !changes) {\n    changedPageRoutes.set(new Set())\n    changedSectionIds.set(new Set())\n    return\n  }\n\n  changedPageRoutes.set(new Set(\n    [...changes.newPages, ...changes.updatedPages].map(changedPage =>\n      normalizeNavigationRoute(resolveVersionedPath(changedPage.route, context)),\n    ),\n  ))\n  const currentPageChanges = changes.updatedPages.find(changedPage =>\n    normalizeNavigationRoute(changedPage.route) === normalizeNavigationRoute(context.logicalPath),\n  )\n  changedSectionIds.set(new Set(currentPageChanges?.sections.map(section => section.id) ?? []))\n}\n\nexport function normalizeNavigationRoute(route: string): string {\n  return route === '/' ? route : route.replace(/\\/+$/, '')\n}\n`)
    return replaceRequired(result, `  const context = resolveVersionContext(routeId)\n  const pathForSidebar = context?.historical ? routeId : resolveLogicalRoute(routeId)\n  resolvedSidebar.set(resolveVersionSidebar(pathForSidebar, resolveLocaleOptions(routeId).sidebar || {}, resolveVersionManifest(routeId)) as LinkItem[])`, `  const normalizedRouteId = resolveLogicalRoute(routeId).replace(/\\/$/, '')\n  const localeOptions = resolveLocaleOptions(routeId)\n  const key = Object.keys(localeOptions.sidebar || {}).find(key =>\n    normalizedRouteId.startsWith(key.replace(/\\/$/, '')),\n  )\n  // If no matching key found, clear the sidebar\n  if (!key) {\n    resolvedSidebar.set([])\n    return\n  }\n  resolvedSidebar.set(localeOptions.sidebar?.[key] || [])`)
  },
  'SidebarGroup.svelte': (source) => {
    let result = replaceRequired(source, `  import { changedPageRoutes, normalizeNavigationRoute } from './layout'\n`)
    result = replaceRequired(result, `  import VersionNavigationBadge from './VersionNavigationBadge.svelte'\n`)
    result = replaceRequired(result, `  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n  const newBadgeLabel = $derived(\n    localeOptions.i18n?.versionNavigationNewLabel ?? 'New',\n  )\n`, `  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n`)
    result = replaceRequired(result, `        {@const changed =\n          item.to && $changedPageRoutes.has(normalizeNavigationRoute(item.to))}\n`)
    result = replaceRequired(result, `          {#snippet labelRenderer()}\n            <span class="link-label">{item.title}</span>\n            {#if changed}<VersionNavigationBadge label={newBadgeLabel} />{/if}\n          {/snippet}\n`)
    result = replaceRequired(result, `            label={changed ? \`${'${item.title}'}, ${'${newBadgeLabel}'}\` : item.title}\n            {labelRenderer}\n`, `            label={item.title}\n`)
    return replaceRequired(result, `  .link-label {\n    --at-apply: 'min-w-0 truncate';\n  }\n`)
  },
  'Toc.svelte': (source) => {
    let result = replaceRequired(source, `  import { changedSectionIds, tocCollapsed } from './layout'\n  import { resolveLocaleOptions } from './locale'\n  import VersionNavigationBadge from './VersionNavigationBadge.svelte'\n`, `  import { tocCollapsed } from './layout'\n  import { resolveLocaleOptions } from './locale'\n`)
    result = replaceRequired(result, `  /**\n   * @param {import('../markdown/anchors').Anchor} anchor\n   * @param {Set<string>} changedSectionIds\n   */\n  export function hasTocVersionChange(anchor, changedSectionIds) {\n    const versionChangeIds =\n      anchor.versionChangeIds ??\n      (anchor.versionChangeId ? [anchor.versionChangeId] : [])\n    return versionChangeIds.some(id => changedSectionIds.has(id))\n  }\n\n`)
    result = replaceRequired(result, `  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n  const newBadgeLabel = $derived(\n    localeOptions.i18n?.versionNavigationNewLabel ?? 'New',\n  )\n`, `  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n`)
    result = replaceRequired(result, `          <span class="item-label">{an.title}</span>\n          {#if hasTocVersionChange(an, $changedSectionIds)}<VersionNavigationBadge\n              label={newBadgeLabel}\n            />{/if}`, `          {an.title}`)
    return replaceRequired(result, `  .item {\n    --at-apply: 'relative z-3 flex min-w-0 items-center cursor-pointer';\n    padding-left: calc(2.625rem + var(--heading-level) * 0.75rem);\n  }\n  .item-label {\n    --at-apply: 'min-w-0 truncate';\n  }`, `  .item {\n    --at-apply: 'relative z-3 block truncate cursor-pointer';\n    padding-left: calc(2.625rem + var(--heading-level) * 0.75rem);\n  }`)
  },
  'sw.js': (source) => {
    return replaceRequired(source, `const versionBase = import.meta.env.SVELTEPRESS_VERSION_BASE\nif (versionBase) {\n  registerRoute(\n    ({ request, url }) => request.mode === 'navigate' && url.pathname.startsWith(\`${'${versionBase}'}/\`),\n    new NetworkFirst({\n      cacheName: 'sveltepress-version-pages',\n      networkTimeoutSeconds: 3,\n      plugins: [\n        new ExpirationPlugin(pageExpiration),\n        pageFallbackPlugin(),\n      ],\n    }),\n  )\n}\n\n`)
  },
}

transforms['Navbar.svelte'] = (source) => {
  let result = replaceRequired(source, `  import { page } from '$app/state'\n  import { locales, resolveLocale } from 'virtual:sveltepress/locale'\n  import { loadCustomSearch } from 'virtual:sveltepress/theme-default/custom-search'\n  import LocaleSelector from 'virtual:sveltepress/theme-default/LocaleSelector.svelte'\n  import { resolveVersionSearch } from 'virtual:sveltepress/theme-default/versioning'\n  import VersionSelector from 'virtual:sveltepress/theme-default/VersionSelector.svelte'\n  import {\n    resolveVersionContext,\n    resolveVersionManifest,\n  } from 'virtual:sveltepress/versions'\n`, `  import { page } from '$app/state'\n  import { onMount } from 'svelte'\n  import { locales, resolveLocale } from 'virtual:sveltepress/locale'\n  import { loadCustomSearch } from 'virtual:sveltepress/theme-default/custom-search'\n  import LocaleSelector from 'virtual:sveltepress/theme-default/LocaleSelector.svelte'\n`)
  result = replaceRequired(result, `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n  const activeLocale = $derived(resolveLocale(page.url.pathname))\n  const activeLang = $derived(activeLocale?.lang ?? '')\n  const versionSearch = $derived(\n    resolveVersionSearch(\n      page.url.pathname,\n      resolveVersionManifest(page.url.pathname),\n    ),\n  )\n  const hasConfiguredSearch = $derived(localeOptions.search !== false)\n  function checkLocalSearch(options: any): boolean {\n    return (\n      options.search !== false &&\n      !options.docsearch &&\n      typeof options.search === 'undefined'\n    )\n  }\n  const isLocalSearch = $derived(checkLocalSearch(localeOptions))\n  const versionedDocsearch = $derived.by(() => {\n    if (!localeOptions.docsearch) return null\n    const metadata = versionSearch.metadata\n    if (!metadata) return localeOptions.docsearch\n    const { facetFilters, ...overrides } = metadata\n    return {\n      ...localeOptions.docsearch,\n      ...overrides,\n      ...(facetFilters\n        ? {\n            searchParameters: {\n              ...localeOptions.docsearch.searchParameters,\n              facetFilters,\n            },\n          }\n        : {}),\n    }\n  })\n`, `  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))\n  const activeLocale = $derived(resolveLocale(page.url.pathname))\n  const activeLang = $derived(activeLocale?.lang ?? '')\n`)
  result = replaceRequired(result, '  async function loadSearch() {', '  onMount(async () => {')
  result = replaceRequired(result, `    if (\n      versionSearch.available &&\n      localeOptions.search &&\n      typeof localeOptions.search === 'string'\n    ) {`, `    if (localeOptions.search && typeof localeOptions.search === 'string') {`)
  result = replaceRequired(result, `    if (\n      versionSearch.available &&\n      localeOptions.docsearch &&\n      !localeOptions.search\n    ) {`, `    if (localeOptions.docsearch && !localeOptions.search) {`)
  result = replaceRequired(result, `  }\n\n  $effect(() => {\n    if (versionSearch.available) void loadSearch()\n  })`, '  })')
  const searchStart = result.indexOf('    {#if !isLocalSearch && hasConfiguredSearch && !versionSearch.available}')
  const searchEnd = result.indexOf('\n\n    <nav class="nav-links"', searchStart)
  if (searchStart === -1 || searchEnd === -1)
    throw new Error('[@sveltepress/default-theme] Cannot locate the version-aware Navbar search block.')
  result = `${result.slice(0, searchStart)}    {#if searchComponent || (localeOptions.search && typeof localeOptions.search !== 'string')}\n      <div\n        class:is-home={isHome || !$sidebar}\n        class:move={!isHome && !hasError && $sidebar}\n        class="doc-search"\n      >\n        <svelte:component this={searchComponent || localeOptions.search} />\n      </div>\n    {:else if localeOptions.docsearch && docsearchComponent}\n      <div\n        class:is-home={isHome || !$sidebar}\n        class:move={!isHome && !hasError && $sidebar}\n        class="doc-search"\n      >\n        {#key localeOptions.docsearch.indexName}\n          <svelte:component\n            this={docsearchComponent}\n            {...localeOptions.docsearch}\n          />\n        {/key}\n      </div>\n    {:else if localeOptions.search !== false}\n      <div\n        class:is-home={isHome || !$sidebar}\n        class:move={!isHome && !hasError && $sidebar}\n        class="doc-search"\n      >\n        {#key activeLang}\n          <LocalSearch />\n        {/key}\n      </div>\n    {/if}${result.slice(searchEnd)}`
  result = replaceRequired(result, `        {#if resolveVersionManifest(page.url.pathname)}<div\n            class="desktop-version-selector"\n          >\n            <VersionSelector />\n          </div>{/if}\n`)
  result = replaceRequired(result, `  .desktop-nav-items,\n  .desktop-locale-selector,\n  .desktop-version-selector {\n    display: none;\n  }`, `  .desktop-nav-items,\n  .desktop-locale-selector {\n    display: none;\n  }`)
  result = replaceRequired(result, `    .desktop-nav-items,\n    .desktop-locale-selector,\n    .desktop-version-selector {\n      display: flex;\n    }`, `    .desktop-nav-items,\n    .desktop-locale-selector {\n      display: flex;\n    }`)
  return replaceRequired(result, `  .search-unavailable {\n    --at-apply: 'text-xs text-zinc-500 dark:text-zinc-400 px-3 flex-none max-w-32 sm:max-w-55 overflow-hidden text-ellipsis whitespace-nowrap';\n  }\n`)
}

export function stripVersioningForManifestlessSite(source: string, id: string): string | null {
  if (id.includes('?'))
    return null
  if (!id.replaceAll('\\', '/').includes('/theme-default/') || !id.includes('/components/'))
    return null
  const transform = transforms[basename(id.split('?', 1)[0])]
  return transform ? transform(source) : null
}
