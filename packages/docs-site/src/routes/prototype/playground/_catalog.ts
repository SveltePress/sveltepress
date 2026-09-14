export type SuccessKind = 'as' | 'degraded' | 'observation'

export interface Entry {
  slug: string
  name: string
  group: string
  success: SuccessKind[]
  barNote?: string
  starter: string
  focusedFile: string
  guideHref: string | null
}

export const GROUPS = [
  'Introduction',
  'Markdown features',
  'Default theme features',
  'Blog theme features',
  'Reference',
  'All features',
] as const

export const KITCHEN_SINK_SLUG = 'kitchen-sink'

export const PERSIST_CAVEAT
  = 'Reloading or opening this URL always boots the Starter as authored. Keep edits with Save-fork in StackBlitz chrome. Open in StackBlitz opens the Starter as authored in a new tab and does not carry Hosted editor edits.'

export const OPEN_IN_STACKBLITZ_HREF
  = 'https://stackblitz.com/fork/github/SveltePress/playground-starters'

export const ENTRIES: Entry[] = [
  {
    slug: 'version-management',
    name: 'Document versions',
    group: 'Introduction',
    success: ['as', 'degraded'],
    barNote: '`versions init` / `create` · `versions build`',
    starter: 'Versions starter',
    focusedFile: 'sveltepress.versions.json',
    guideHref: '/guide/version-management/',
  },
  {
    slug: 'i18n',
    name: 'Internationalization',
    group: 'Introduction',
    success: ['as'],
    starter: 'i18n starter',
    focusedFile: 'config/locales.ts',
    guideHref: '/guide/i18n/',
  },
  {
    slug: 'typescript',
    name: 'Working with TypeScript',
    group: 'Introduction',
    success: ['as'],
    starter: 'TypeScript starter',
    focusedFile: 'vite.config.ts',
    guideHref: '/guide/typescript/',
  },
  {
    slug: 'custom-theme',
    name: 'Custom theme',
    group: 'Introduction',
    success: ['as'],
    starter: 'Custom theme starter',
    focusedFile: 'src/routes/+layout.svelte',
    guideHref: null,
  },
  {
    slug: 'markdown/basic-writing',
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
    slug: 'blog-theme/configuration',
    name: 'Configuration',
    group: 'Blog theme features',
    success: ['as'],
    starter: 'Blog starter',
    focusedFile: 'vite.config.ts',
    guideHref: '/guide/blog-theme/configuration/',
  },
  {
    slug: 'blog-theme/writing-posts',
    name: 'Writing posts',
    group: 'Blog theme features',
    success: ['as'],
    starter: 'Blog starter',
    focusedFile: 'src/posts/hello-sveltepress.md',
    guideHref: '/guide/blog-theme/writing-posts/',
  },
  {
    slug: 'blog-theme/features',
    name: 'Features',
    group: 'Blog theme features',
    success: ['as', 'degraded', 'observation'],
    barNote: 'masonry / tags / RSS · OG PNG, Pagefind · giscus',
    starter: 'Blog starter',
    focusedFile: 'src/posts/editorial-showcase.md',
    guideHref: '/guide/blog-theme/features/',
  },
  {
    slug: 'blog-theme/customization',
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
    slug: 'virtual-modules',
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

export function entryBySlug(slug: string | undefined): Entry | undefined {
  if (!slug)
    return undefined
  const normalized = slug.replace(/^\/+|\/+$/g, '')
  return ENTRIES.find(entry => entry.slug === normalized)
}

export function entriesInGroup(group: string): Entry[] {
  return ENTRIES.filter(entry => entry.group === group)
}
