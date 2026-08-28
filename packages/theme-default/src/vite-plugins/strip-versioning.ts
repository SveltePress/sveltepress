/* eslint-disable no-template-curly-in-string */
import { basename } from 'node:path'

type SourceTransform = (source: string) => string

function replaceRequired(source: string, search: string, replacement = ''): string {
  if (!source.includes(search))
    throw new Error(`[@sveltepress/default-theme] Cannot preserve the no-manifest bundle because a versioning transform anchor changed: ${search.slice(0, 80)}`)
  return source.replace(search, replacement)
}

const transforms: Record<string, SourceTransform> = {
  'ActionButton.svelte': source => replaceRequired(
    replaceRequired(
      replaceRequired(source, `  import { page } from '$app/state'\n  import {\n    resolveVersionContext,\n    resolveVersionedPath,\n  } from 'virtual:sveltepress/versions'\n`),
      `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const resolvedTo = $derived(\n    external ? to : resolveVersionedPath(to, versionContext),\n  )\n`,
    ),
    'href={external ? to : getPathFromBase(resolvedTo)}',
    'href={external ? to : getPathFromBase(to)}',
  ),
  'EditPage.svelte': (source) => {
    let result = replaceRequired(source, `  import { resolveHistoricalEditLink } from 'virtual:sveltepress/theme-default/versioning'\n  import { manifest } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, '  const routeId = $derived(page.route.id)', '  const routeId = page.route.id')
    result = replaceRequired(result, `  const resolvedEditLink = $derived(\n    resolveHistoricalEditLink(\n      themeOptions.editLink,\n      routeId,\n      pageType,\n      manifest,\n    ),\n  )\n\n`, '\n')
    result = replaceRequired(result, `  function handleEditLinkClick() {\n    if (resolvedEditLink) window.open(resolvedEditLink, '_blank')\n  }`, `  function handleEditLinkClick() {\n    if (themeOptions.editLink) {\n      window.open(\n        themeOptions.editLink.replace(':route', \`${'${routeId}'}/+page.${'${pageType}'}\`),\n        '_blank',\n      )\n    }\n  }`)
    return replaceRequired(result, `{#if resolvedEditLink}\n  <div\n    class="edit-link"\n    onclick={handleEditLinkClick}\n    onkeyup={handleEditLinkClick}\n    role="link"\n    tabindex="0"\n  >\n    <div class="edit-icon">\n      <Edit />\n    </div>\n    <div class="edit-text">\n      {themeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT}\n    </div>\n  </div>\n{/if}`, `<div\n  class="edit-link"\n  onclick={handleEditLinkClick}\n  onkeyup={handleEditLinkClick}\n  role="link"\n  tabindex="0"\n>\n  <div class="edit-icon">\n    <Edit />\n  </div>\n  <div class="edit-text">\n    {themeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT}\n  </div>\n</div>`)
  },
  'GlobalLayout.svelte': (source) => {
    let result = replaceRequired(source, `  import VersionFallbackNotice from 'virtual:sveltepress/theme-default/VersionFallbackNotice.svelte'\n  import VersionLifecycleBanner from 'virtual:sveltepress/theme-default/VersionLifecycleBanner.svelte'\n  import { manifest } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, '    resolveSidebar(page.route.id)\n    $sidebarCollapsed', '    $sidebarCollapsed')
    return replaceRequired(result, `    {#if manifest}\n      <VersionFallbackNotice />\n      <VersionLifecycleBanner />\n    {/if}\n`)
  },
  'Link.svelte': (source) => {
    let result = replaceRequired(source, `  import { page } from '$app/state'\n  import {\n    resolveVersionContext,\n    resolveVersionedPath,\n  } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, '   * @property {boolean} [withVersion] - Whether the active documentation version should be applied\n')
    result = replaceRequired(result, '    withVersion = true,\n')
    result = replaceRequired(result, `  let versionContext = $derived(resolveVersionContext(page.url.pathname))\n  let versionedTo = $derived(\n    withVersion ? resolveVersionedPath(to, versionContext) : to,\n  )\n  let toWithBase = $derived(isExternal ? to : getPathFromBase(versionedTo))`, '  let toWithBase = $derived(isExternal ? to : getPathFromBase(to))')
    return result
  },
  'Logo.svelte': source => replaceRequired(
    replaceRequired(source, `  import { parseImageSrc } from './utils'`, `  import { getPathFromBase, parseImageSrc } from './utils'`),
    '<NavItem to="/" title={siteConfig.title} brand>',
    '<NavItem to={getPathFromBase(\'/\')} title={siteConfig.title} brand>',
  ),
  'NavItem.svelte': (source) => {
    let result = replaceRequired(source, `  import {\n    resolveVersionContext,\n    resolveVersionedPath,\n  } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const resolvedTo = $derived(\n    external ? to : resolveVersionedPath(to, versionContext),\n  )\n  const normalizedTo = $derived(\n    resolvedTo.endsWith('/') ? resolvedTo.slice(0, -1) : resolvedTo,\n  )\n  const isExactMatch = p => p === resolvedTo`, `  const normalizedTo = to.endsWith('/') ? to.slice(0, -1) : to\n  const isExactMatch = p => p === to`)
    return replaceRequired(result, 'href={external ? to : getPathFromBase(resolvedTo)}', 'href={external ? to : getPathFromBase(to)}')
  },
  'NavbarMobile.svelte': source => replaceRequired(
    replaceRequired(source, `  import VersionSelector from 'virtual:sveltepress/theme-default/VersionSelector.svelte'\n`),
    '    <VersionSelector mobile />\n',
  ),
  'PageLayout.svelte': (source) => {
    let result = replaceRequired(source, `  import { manifest, resolveVersionContext } from 'virtual:sveltepress/versions'\n`)
    result = replaceRequired(result, `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const canonical = $derived(manifest ? page.url.pathname : null)\n  const noIndex = $derived.by(() => {\n    if (!versionContext?.historical) return false\n    return (\n      versionContext.version.status === 'eol' &&\n      versionContext.version.noIndex !== false\n    )\n  })\n`)
    return replaceRequired(result, `  {#if canonical}<link rel="canonical" href={canonical} />{/if}\n  {#if noIndex}<meta name="robots" content="noindex,follow" />{/if}\n`)
  },
  'layout.ts': (source) => {
    const result = replaceRequired(source, `import { resolveVersionSidebar } from 'virtual:sveltepress/theme-default/versioning'\nimport { manifest as versionManifest } from 'virtual:sveltepress/versions'\n`)
    return replaceRequired(result, `  resolvedSidebar.set(resolveVersionSidebar(routeId, themeOptions.sidebar || {}, versionManifest) as LinkItem[])`, `  const normalizedRouteId = routeId.replace(/\\/$/, '')\n  const key = Object.keys(themeOptions.sidebar || {}).find(key =>\n    normalizedRouteId.startsWith(key.replace(/\\/$/, '')),\n  )\n  // If no matching key found, clear the sidebar\n  if (!key) {\n    resolvedSidebar.set([])\n    return\n  }\n  resolvedSidebar.set(themeOptions.sidebar?.[key] || [])`)
  },
  'sw.js': (source) => {
    const result = replaceRequired(source, `import { NetworkFirst } from 'workbox-strategies'\n`)
    return replaceRequired(result, `const versionBase = import.meta.env.SVELTEPRESS_VERSION_BASE\nif (versionBase) {\n  registerRoute(\n    ({ request, url }) => request.mode === 'navigate' && url.pathname.startsWith(\`${'${versionBase}'}/\`),\n    new NetworkFirst({ cacheName: 'sveltepress-version-pages' }),\n  )\n}\n\n`)
  },
}

transforms['Navbar.svelte'] = (source) => {
  let result = replaceRequired(source, `  import { resolveVersionSearch } from 'virtual:sveltepress/theme-default/versioning'\n  import VersionSelector from 'virtual:sveltepress/theme-default/VersionSelector.svelte'\n  import { manifest, resolveVersionContext } from 'virtual:sveltepress/versions'\n`)
  result = replaceRequired(result, `  import { page } from '$app/state'\n  import themeOptions`, `  import { page } from '$app/state'\n  import { onMount } from 'svelte'\n  import themeOptions`)
  result = replaceRequired(result, `  const versionContext = $derived(resolveVersionContext(page.url.pathname))\n  const versionSearch = $derived(\n    resolveVersionSearch(page.url.pathname, manifest),\n  )\n  const hasConfiguredSearch = $derived(\n    Boolean(themeOptions.search || themeOptions.docsearch),\n  )\n  const versionedDocsearch = $derived.by(() => {\n    if (!themeOptions.docsearch) return null\n    const metadata = versionSearch.metadata\n    if (!metadata) return themeOptions.docsearch\n    const { facetFilters, ...overrides } = metadata\n    return {\n      ...themeOptions.docsearch,\n      ...overrides,\n      ...(facetFilters\n        ? {\n            searchParameters: {\n              ...themeOptions.docsearch.searchParameters,\n              facetFilters,\n            },\n          }\n        : {}),\n    }\n  })\n`)
  result = replaceRequired(result, '  async function loadSearch() {', '  onMount(async () => {')
  result = replaceRequired(result, `    if (\n      versionSearch.available &&\n      themeOptions.search &&\n      typeof themeOptions.search === 'string'\n    ) {`, `    if (themeOptions.search && typeof themeOptions.search === 'string') {`)
  result = replaceRequired(result, `    if (\n      versionSearch.available &&\n      themeOptions.docsearch &&\n      !themeOptions.search\n    ) {`, `    if (themeOptions.docsearch && !themeOptions.search) {`)
  result = replaceRequired(result, `  }\n\n  $effect(() => {\n    if (versionSearch.available) void loadSearch()\n  })`, '  })')
  const searchStart = result.indexOf('    {#if hasConfiguredSearch && !versionSearch.available}')
  const searchEnd = result.indexOf('\n\n    <nav class="nav-links"', searchStart)
  if (searchStart === -1 || searchEnd === -1)
    throw new Error('[@sveltepress/default-theme] Cannot locate the version-aware Navbar search block.')
  result = `${result.slice(0, searchStart)}    {#if searchComponent || (themeOptions.search && typeof themeOptions.search !== 'string')}\n      <div\n        class:is-home={isHome}\n        class:move={!isHome && !hasError}\n        class="doc-search"\n      >\n        <svelte:component this={searchComponent || themeOptions.search} />\n      </div>\n    {:else if themeOptions.docsearch && docsearchComponent}\n      <div\n        class:is-home={isHome}\n        class:move={!isHome && !hasError}\n        class="doc-search"\n      >\n        <svelte:component\n          this={docsearchComponent}\n          {...themeOptions.docsearch}\n        />\n      </div>\n    {/if}${result.slice(searchEnd)}`
  result = replaceRequired(result, '        {#if manifest}<VersionSelector />{/if}\n')
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
