export type LeafKind = 'guide-entry' | 'reference-entry' | 'not-an-entry'

export interface LeafInfo {
  logicalPath: string
  kind: LeafKind
  name: string | null
  group: string | null
  playgroundPath: string | null
  historical: boolean
}

const GUIDE_ENTRIES: Record<string, { name: string, group: string, playgroundPath: string }> = {
  '/guide/version-management/': { name: 'Document versions', group: 'Guide', playgroundPath: '/playground/version-management/' },
  '/guide/i18n/': { name: 'Internationalization', group: 'Guide', playgroundPath: '/playground/i18n/' },
  '/guide/typescript/': { name: 'Working with TypeScript', group: 'Guide', playgroundPath: '/playground/typescript/' },
  '/guide/markdown/basic-writing/': { name: 'Basic writing', group: 'Markdown', playgroundPath: '/playground/markdown/basic-writing/' },
  '/guide/markdown/frontmatter/': { name: 'Frontmatter', group: 'Markdown', playgroundPath: '/playground/markdown/frontmatter/' },
  '/guide/markdown/svelte-in-markdown/': { name: 'Svelte in Markdown', group: 'Markdown', playgroundPath: '/playground/markdown/svelte-in-markdown/' },
  '/guide/default-theme/frontmatter/': { name: 'Frontmatter', group: 'Default Theme', playgroundPath: '/playground/default-theme/frontmatter/' },
  '/guide/default-theme/navbar/': { name: 'Navbar', group: 'Default Theme', playgroundPath: '/playground/default-theme/navbar/' },
  '/guide/default-theme/sidebar/': { name: 'Sidebar', group: 'Default Theme', playgroundPath: '/playground/default-theme/sidebar/' },
  '/guide/default-theme/home-page/': { name: 'Home page', group: 'Default Theme', playgroundPath: '/playground/default-theme/home-page/' },
  '/guide/default-theme/builtin-components/': { name: 'Built-in Components', group: 'Default Theme', playgroundPath: '/playground/default-theme/builtin-components/' },
  '/guide/default-theme/headings-and-anchors/': { name: 'Headings & Anchors', group: 'Default Theme', playgroundPath: '/playground/default-theme/headings-and-anchors/' },
  '/guide/default-theme/admonitions/': { name: 'Admonitions', group: 'Default Theme', playgroundPath: '/playground/default-theme/admonitions/' },
  '/guide/default-theme/code-related/': { name: 'Code related', group: 'Default Theme', playgroundPath: '/playground/default-theme/code-related/' },
  '/guide/default-theme/twoslash/': { name: 'Twoslash', group: 'Default Theme', playgroundPath: '/playground/default-theme/twoslash/' },
  '/guide/default-theme/unocss/': { name: 'Unocss', group: 'Default Theme', playgroundPath: '/playground/default-theme/unocss/' },
  '/guide/default-theme/search/': { name: 'Search', group: 'Default Theme', playgroundPath: '/playground/default-theme/search/' },
  '/guide/default-theme/pwa/': { name: 'PWA', group: 'Default Theme', playgroundPath: '/playground/default-theme/pwa/' },
  '/guide/default-theme/google-analytics/': { name: 'Google Analytics', group: 'Default Theme', playgroundPath: '/playground/default-theme/google-analytics/' },
  '/guide/blog-theme/configuration/': { name: 'Configuration', group: 'Blog theme', playgroundPath: '/playground/blog-theme/configuration/' },
  '/guide/blog-theme/writing-posts/': { name: 'Writing posts', group: 'Blog theme', playgroundPath: '/playground/blog-theme/writing-posts/' },
  '/guide/blog-theme/features/': { name: 'Features', group: 'Blog theme', playgroundPath: '/playground/blog-theme/features/' },
  '/guide/blog-theme/customization/': { name: 'Customisation', group: 'Blog theme', playgroundPath: '/playground/blog-theme/customization/' },
}

const REFERENCE_ENTRIES: Record<string, { name: string, group: string, playgroundPath: string }> = {
  '/reference/vite-plugin/': { name: 'Vite plugin', group: 'Reference', playgroundPath: '/playground/vite-plugin/' },
  '/reference/site/': { name: 'virtual:sveltepress/site', group: 'Reference', playgroundPath: '/playground/virtual-modules/' },
  '/reference/locale/': { name: 'virtual:sveltepress/locale', group: 'Reference', playgroundPath: '/playground/virtual-modules/' },
  '/reference/versions/': { name: 'virtual:sveltepress/versions', group: 'Reference', playgroundPath: '/playground/virtual-modules/' },
}

export const DEMO_LEAVES = [
  { href: '/guide/markdown/basic-writing/', label: 'Guide Entry' },
  { href: '/reference/vite-plugin/', label: 'Reference Entry' },
  { href: '/guide/quick-start/', label: 'Not an Entry' },
] as const

export const VARIANT_KEYS = ['A', 'B', 'C', 'D'] as const
export type VariantKey = (typeof VARIANT_KEYS)[number]

export const VARIANT_NAMES: Record<VariantKey, string> = {
  A: 'Beside the title',
  B: 'Article header strip',
  C: 'After the intro',
  D: 'TOC column / mobile dock',
}

export function logicalPath(pathname: string): string {
  let path = pathname.split('?')[0] ?? pathname
  path = path.replace(/^\/(zh|bn)(?=\/|$)/, '')
  path = path.replace(/^\/v\/[^/]+/, '')
  if (!path.startsWith('/'))
    path = `/${path}`
  if (!path.endsWith('/'))
    path += '/'
  return path
}

export function isHistoricalPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(zh|bn)(?=\/|$)/, '')
  return /^\/v\/[^/]+\//.test(withoutLocale)
}

export function resolveLeaf(pathname: string): LeafInfo {
  const path = logicalPath(pathname)
  const historical = isHistoricalPath(pathname)
  const guide = GUIDE_ENTRIES[path]
  if (guide) {
    return {
      logicalPath: path,
      kind: 'guide-entry',
      historical,
      ...guide,
    }
  }
  const reference = REFERENCE_ENTRIES[path]
  if (reference) {
    return {
      logicalPath: path,
      kind: 'reference-entry',
      historical,
      ...reference,
    }
  }
  return {
    logicalPath: path,
    kind: 'not-an-entry',
    name: null,
    group: null,
    playgroundPath: null,
    historical,
  }
}

export function isPlaygroundEntry(leaf: LeafInfo): boolean {
  return !leaf.historical && (leaf.kind === 'guide-entry' || leaf.kind === 'reference-entry')
}
