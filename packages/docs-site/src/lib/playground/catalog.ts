export type SuccessKind = 'as' | 'degraded' | 'observation'
export type CatalogLocale = 'en' | 'zh' | 'bn'

export interface Entry {
  slug: string
  name: string
  group: string
  success: SuccessKind[]
  barNote?: string
  starter: StarterName
  focusedFile: string
  guideHref: string | null
}

export interface OpenInPlaygroundVisibility {
  visible: boolean
  href: string | null
}

export const GROUPS = [
  'Introduction',
  'Markdown features',
  'Default theme features',
  'Blog theme features',
  'Reference',
  'All features',
] as const

export const BASIC_WRITING_SLUG = 'markdown/basic-writing'
export const I18N_SLUG = 'i18n'
export const BLOG_CONFIGURATION_SLUG = 'blog-theme/configuration'
export const BLOG_WRITING_POSTS_SLUG = 'blog-theme/writing-posts'
export const BLOG_FEATURES_SLUG = 'blog-theme/features'
export const BLOG_CUSTOMIZATION_SLUG = 'blog-theme/customization'
export const CUSTOM_THEME_SLUG = 'custom-theme'
export const KITCHEN_SINK_SLUG = 'kitchen-sink'
export const TYPESCRIPT_SLUG = 'typescript'
export const VERSION_MANAGEMENT_SLUG = 'version-management'
export const VIRTUAL_MODULES_SLUG = 'virtual-modules'

export const PLAYGROUND_STARTERS_REPO = 'SveltePress/playground-starters'

/** sveltepress.site embeds this tag, not `main`. */
export const PINNED_STARTERS_TAG = 'playground-v1.5'

export const STARTER_SUBDIRECTORIES = {
  'Default Theme starter': 'default-theme',
  'TypeScript starter': 'typescript',
  'Blog starter': 'blog',
  'i18n starter': 'i18n',
  'Versions starter': 'versions',
  'Custom theme starter': 'custom-theme',
  'Kitchen-sink starter': 'kitchen-sink',
} as const

export type StarterName = keyof typeof STARTER_SUBDIRECTORIES

const DEFAULT_THEME_STARTER: StarterName = 'Default Theme starter'
const DEDICATED_SHIPPING_SLUGS = [
  VERSION_MANAGEMENT_SLUG,
  I18N_SLUG,
  CUSTOM_THEME_SLUG,
  TYPESCRIPT_SLUG,
  BLOG_CONFIGURATION_SLUG,
  BLOG_WRITING_POSTS_SLUG,
  BLOG_FEATURES_SLUG,
  BLOG_CUSTOMIZATION_SLUG,
] as const

const LOCALE_PREFIX: Record<CatalogLocale, string> = {
  en: '',
  zh: '/zh',
  bn: '/bn',
}

const HIDDEN_LEAF_PATHS = new Set([
  '/guide/introduction/',
  '/guide/quick-start/',
  '/guide/themes/',
  '/guide/blog-theme/getting-started/',
  '/guide/custom-theme/',
  '/reference/default-theme/',
  '/reference/blog-theme/',
  '/reference/cli/',
])

const VIRTUAL_MODULE_LEAVES = new Set([
  '/reference/site/',
  '/reference/locale/',
  '/reference/versions/',
])

const LOCALIZED_NAMES: Record<string, Partial<Record<CatalogLocale, string>>> = {
  'version-management': { zh: '文档版本管理', bn: 'ডকুমেন্ট সংস্করণ ব্যবস্থাপনা' },
  'i18n': { zh: '国际化', bn: 'আন্তর্জাতিকীকরণ' },
  'typescript': { zh: '与 Typescript 一起开发', bn: 'Typescript ব্যবহার' },
  'custom-theme': { zh: '自定义主题', bn: 'কাস্টম থিম' },
  'markdown/basic-writing': { zh: '写作基础', bn: 'হাতেখড়ি' },
  'markdown/frontmatter': { zh: 'Frontmatter', bn: 'Frontmatter' },
  'markdown/svelte-in-markdown': { zh: '在 Markdown 中使用 Svelte', bn: 'Markdown এ Svelte' },
  'default-theme/frontmatter': { zh: 'Frontmatter', bn: 'Frontmatter' },
  'default-theme/navbar': { zh: '导航栏', bn: 'ন্যাভবার' },
  'default-theme/sidebar': { zh: '侧边栏', bn: 'সাইডবার' },
  'default-theme/home-page': { zh: '主页', bn: 'হোমপেজ' },
  'default-theme/builtin-components': { zh: '内置组件', bn: 'বিল্ট-ইন কম্পোনেন্ট' },
  'default-theme/headings-and-anchors': { zh: '标题与页内导航', bn: 'হেডিংস এবং অ্যাঙ্কর' },
  'default-theme/admonitions': { zh: '高亮块', bn: 'অ্যাডমনিশন' },
  'default-theme/code-related': { zh: '代码相关', bn: 'কোড সম্পর্কিত' },
  'default-theme/twoslash': { zh: 'Twoslash', bn: 'Twoslash' },
  'default-theme/unocss': { zh: 'Unocss', bn: 'Unocss' },
  'default-theme/search': { zh: '搜索', bn: 'সার্চ' },
  'default-theme/pwa': { zh: 'PWA', bn: 'PWA' },
  'default-theme/google-analytics': { zh: 'Google Analytics', bn: 'Google Analytics' },
  'blog-theme/configuration': { zh: '配置', bn: 'কনফিগারেশন' },
  'blog-theme/writing-posts': { zh: '写文章', bn: 'পোস্ট লেখা' },
  'blog-theme/features': { zh: '特性', bn: 'ফিচারসমূহ' },
  'blog-theme/customization': { zh: '自定义', bn: 'কাস্টমাইজেশন' },
  'vite-plugin': { zh: 'Vite 插件', bn: 'Vite প্লাগিন' },
  'virtual-modules': { zh: '虚拟模块', bn: 'ভার্চুয়াল মডিউল' },
}

export const ENTRIES: Entry[] = [
  {
    slug: VERSION_MANAGEMENT_SLUG,
    name: 'Document versions',
    group: 'Introduction',
    success: ['as', 'degraded'],
    barNote: '`versions init` / `create` · `versions build`',
    starter: 'Versions starter',
    focusedFile: 'sveltepress.versions.json',
    guideHref: '/guide/version-management/',
  },
  {
    slug: I18N_SLUG,
    name: 'Internationalization',
    group: 'Introduction',
    success: ['as'],
    starter: 'i18n starter',
    focusedFile: 'config/locales.ts',
    guideHref: '/guide/i18n/',
  },
  {
    slug: TYPESCRIPT_SLUG,
    name: 'Working with TypeScript',
    group: 'Introduction',
    success: ['as'],
    starter: 'TypeScript starter',
    focusedFile: 'vite.config.ts',
    guideHref: '/guide/typescript/',
  },
  {
    slug: CUSTOM_THEME_SLUG,
    name: 'Custom theme',
    group: 'Introduction',
    success: ['as'],
    starter: 'Custom theme starter',
    focusedFile: 'src/routes/+layout.svelte',
    guideHref: null,
  },
  {
    slug: BASIC_WRITING_SLUG,
    name: 'Basic Writing',
    group: 'Markdown features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/markdown/basic-writing/+page.md',
    guideHref: '/guide/markdown/basic-writing/',
  },
  {
    slug: 'markdown/frontmatter',
    name: 'Frontmatter',
    group: 'Markdown features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/markdown/frontmatter/+page.md',
    guideHref: '/guide/markdown/frontmatter/',
  },
  {
    slug: 'markdown/svelte-in-markdown',
    name: 'Svelte in Markdown',
    group: 'Markdown features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/markdown/svelte-in-markdown/+page.md',
    guideHref: '/guide/markdown/svelte-in-markdown/',
  },
  {
    slug: 'default-theme/frontmatter',
    name: 'Frontmatter',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/default-theme/frontmatter/+page.md',
    guideHref: '/guide/default-theme/frontmatter/',
  },
  {
    slug: 'default-theme/navbar',
    name: 'Navbar',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'config/navbar.js',
    guideHref: '/guide/default-theme/navbar/',
  },
  {
    slug: 'default-theme/sidebar',
    name: 'Sidebar',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'config/sidebar.js',
    guideHref: '/guide/default-theme/sidebar/',
  },
  {
    slug: 'default-theme/home-page',
    name: 'Home page',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/+page.md',
    guideHref: '/guide/default-theme/home-page/',
  },
  {
    slug: 'default-theme/builtin-components',
    name: 'Built-in Components',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/default-theme/builtin-components/+page.md',
    guideHref: '/guide/default-theme/builtin-components/',
  },
  {
    slug: 'default-theme/headings-and-anchors',
    name: 'Headings & Anchors',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/default-theme/headings-and-anchors/+page.md',
    guideHref: '/guide/default-theme/headings-and-anchors/',
  },
  {
    slug: 'default-theme/admonitions',
    name: 'Admonitions',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/default-theme/admonitions/+page.md',
    guideHref: '/guide/default-theme/admonitions/',
  },
  {
    slug: 'default-theme/code-related',
    name: 'Code related',
    group: 'Default theme features',
    success: ['as'],
    barNote: 'Live code, Import code, install-pkg',
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/default-theme/code-related/+page.md',
    guideHref: '/guide/default-theme/code-related/',
  },
  {
    slug: 'default-theme/twoslash',
    name: 'Twoslash',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/default-theme/twoslash/+page.md',
    guideHref: '/guide/default-theme/twoslash/',
  },
  {
    slug: 'default-theme/unocss',
    name: 'Unocss',
    group: 'Default theme features',
    success: ['as'],
    starter: 'Default Theme starter',
    focusedFile: 'src/routes/guide/default-theme/unocss/+page.md',
    guideHref: '/guide/default-theme/unocss/',
  },
  {
    slug: 'default-theme/search',
    name: 'Search',
    group: 'Default theme features',
    success: ['degraded', 'observation'],
    barNote: 'Pagefind index · Docsearch / Meilisearch',
    starter: 'Default Theme starter',
    focusedFile: 'vite.config.js',
    guideHref: '/guide/default-theme/search/',
  },
  {
    slug: 'default-theme/pwa',
    name: 'PWA',
    group: 'Default theme features',
    success: ['observation', 'degraded'],
    barNote: 'install prompt · preview-origin service worker',
    starter: 'Default Theme starter',
    focusedFile: 'svelte.config.js',
    guideHref: '/guide/default-theme/pwa/',
  },
  {
    slug: 'default-theme/google-analytics',
    name: 'Google Analytics',
    group: 'Default theme features',
    success: ['observation'],
    starter: 'Default Theme starter',
    focusedFile: 'vite.config.js',
    guideHref: '/guide/default-theme/google-analytics/',
  },
  {
    slug: BLOG_CONFIGURATION_SLUG,
    name: 'Configuration',
    group: 'Blog theme features',
    success: ['as'],
    starter: 'Blog starter',
    focusedFile: 'vite.config.ts',
    guideHref: '/guide/blog-theme/configuration/',
  },
  {
    slug: BLOG_WRITING_POSTS_SLUG,
    name: 'Writing posts',
    group: 'Blog theme features',
    success: ['as'],
    starter: 'Blog starter',
    focusedFile: 'src/posts/hello-sveltepress.md',
    guideHref: '/guide/blog-theme/writing-posts/',
  },
  {
    slug: BLOG_FEATURES_SLUG,
    name: 'Features',
    group: 'Blog theme features',
    success: ['as', 'degraded', 'observation'],
    barNote: 'masonry / tags / RSS / timeline · OG PNG, Pagefind · giscus',
    starter: 'Blog starter',
    focusedFile: 'src/posts/editorial-showcase.md',
    guideHref: '/guide/blog-theme/features/',
  },
  {
    slug: BLOG_CUSTOMIZATION_SLUG,
    name: 'Customisation',
    group: 'Blog theme features',
    success: ['as'],
    starter: 'Blog starter',
    focusedFile: 'src/app.css',
    guideHref: '/guide/blog-theme/customization/',
  },
  {
    slug: 'vite-plugin',
    name: 'Vite plugin',
    group: 'Reference',
    success: ['as', 'observation'],
    barNote: 'edit sveltepress({…}) · llms, addInspect',
    starter: 'Default Theme starter',
    focusedFile: 'vite.config.js',
    guideHref: '/reference/vite-plugin/',
  },
  {
    slug: VIRTUAL_MODULES_SLUG,
    name: 'Virtual modules',
    group: 'Reference',
    success: ['as'],
    starter: 'Kitchen-sink starter',
    focusedFile: 'src/routes/reference/virtual-modules/+page.md',
    guideHref: '/reference/site/',
  },
  {
    slug: KITCHEN_SINK_SLUG,
    name: 'Kitchen sink',
    group: 'All features',
    success: ['as', 'degraded', 'observation'],
    barNote: 'coexistable Default Theme set',
    starter: 'Kitchen-sink starter',
    focusedFile: 'src/routes/+page.md',
    guideHref: null,
  },
]

const SHIPPING_SLUGS = new Set([
  ...ENTRIES.filter(entry => entry.starter === DEFAULT_THEME_STARTER).map(entry => entry.slug),
  ...DEDICATED_SHIPPING_SLUGS,
])

const ENTRIES_BY_SLUG = new Map(ENTRIES.map(entry => [entry.slug, entry]))
const ENTRIES_BY_GUIDE_HREF = new Map(
  ENTRIES.filter(entry => entry.guideHref).map(entry => [entry.guideHref!, entry]),
)

export function entryBySlug(slug: string | undefined): Entry | undefined {
  if (!slug)
    return undefined
  return ENTRIES_BY_SLUG.get(normalizeSlug(slug))
}

export function shippingEntries(): Entry[] {
  return ENTRIES.filter(entry => SHIPPING_SLUGS.has(entry.slug))
}

export function entryUrl(slug: string, locale: CatalogLocale = 'en'): string {
  return `${LOCALE_PREFIX[locale]}/playground/${normalizeSlug(slug)}/`
}

export function playgroundHomeUrl(locale: CatalogLocale = 'en'): string {
  return `${LOCALE_PREFIX[locale]}/playground/`
}

export function localePath(path: string, locale: CatalogLocale = 'en'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (locale === 'en')
    return normalized
  return `${LOCALE_PREFIX[locale]}${normalized}`
}

export function isPlaygroundPathRegistered(pathname: string): boolean {
  if (isHistoricalPath(pathname))
    return false
  const logical = logicalPath(pathname)
  if (logical === '/playground/')
    return true
  const slug = playgroundSlug(logical)
  return slug !== undefined && SHIPPING_SLUGS.has(slug)
}

export function githubImportPath(entry: Entry): string {
  return `${PLAYGROUND_STARTERS_REPO}/tree/${PINNED_STARTERS_TAG}/${STARTER_SUBDIRECTORIES[entry.starter]}`
}

export function openInStackBlitzUrl(entry: Entry): string {
  return `https://stackblitz.com/fork/github/${githubImportPath(entry)}`
}

export function localizedName(entry: Entry, locale: CatalogLocale): string {
  if (locale === 'en')
    return entry.name
  return LOCALIZED_NAMES[entry.slug]?.[locale] ?? entry.name
}

export function openInPlaygroundHref(pathname: string): string | null {
  const resolved = resolveLeafEntry(pathname)
  if (!resolved)
    return null
  return entryUrl(resolved.entry.slug, resolved.locale)
}

export function openInPlayground(pathname: string): OpenInPlaygroundVisibility {
  const resolved = resolveLeafEntry(pathname)
  if (!resolved || !SHIPPING_SLUGS.has(resolved.entry.slug))
    return { visible: false, href: null }

  return { visible: true, href: entryUrl(resolved.entry.slug, resolved.locale) }
}

function resolveLeafEntry(pathname: string): { entry: Entry, locale: CatalogLocale } | null {
  if (isHistoricalPath(pathname))
    return null

  const locale = localeFromPath(pathname)
  const logical = logicalPath(pathname)
  if (HIDDEN_LEAF_PATHS.has(logical))
    return null

  if (VIRTUAL_MODULE_LEAVES.has(logical)) {
    const entry = entryBySlug(VIRTUAL_MODULES_SLUG)
    return entry ? { entry, locale } : null
  }

  const entry = ENTRIES_BY_GUIDE_HREF.get(logical)
  if (!entry)
    return null

  return { entry, locale }
}

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, '')
}

function localeFromPath(pathname: string): CatalogLocale {
  if (pathname === '/zh' || pathname.startsWith('/zh/'))
    return 'zh'
  if (pathname === '/bn' || pathname.startsWith('/bn/'))
    return 'bn'
  return 'en'
}

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(?:zh|bn)(?=\/|$)/, '') || '/'
}

function isHistoricalPath(pathname: string): boolean {
  return /^\/v\/[^/]+(?:\/|$)/.test(stripLocalePrefix(pathname))
}

function withTrailingSlash(pathname: string): string {
  if (pathname.endsWith('/'))
    return pathname
  return `${pathname}/`
}

function logicalPath(pathname: string): string {
  let path = pathname.split('?')[0] ?? pathname
  path = path.split('#')[0] ?? path
  path = stripLocalePrefix(path)
  path = path.replace(/^\/v\/[^/]+/, '') || '/'
  if (!path.startsWith('/'))
    path = `/${path}`
  return withTrailingSlash(path)
}

function playgroundSlug(logical: string): string | undefined {
  if (!logical.startsWith('/playground/'))
    return undefined
  const slug = logical.slice('/playground/'.length).replace(/\/+$/, '')
  return slug || undefined
}
