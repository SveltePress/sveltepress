import { describe, expect, it } from 'vitest'
import {
  BASIC_WRITING_SLUG,
  CUSTOM_THEME_SLUG,
  entryBySlug,
  entryUrl,
  githubImportPath,
  isPlaygroundPathRegistered,
  KITCHEN_SINK_SLUG,
  localizedName,
  openInPlayground,
  openInPlaygroundHref,
  openInStackBlitzUrl,
  PINNED_STARTERS_TAG,
  PLAYGROUND_STARTERS_REPO,
  shippingEntries,
  STARTER_SUBDIRECTORIES,
  VIRTUAL_MODULES_SLUG,
} from '../src/lib/playground/catalog.ts'

const ALL_SLUGS = [
  'version-management',
  'i18n',
  'typescript',
  'custom-theme',
  'markdown/basic-writing',
  'markdown/frontmatter',
  'markdown/svelte-in-markdown',
  'default-theme/frontmatter',
  'default-theme/navbar',
  'default-theme/sidebar',
  'default-theme/home-page',
  'default-theme/builtin-components',
  'default-theme/headings-and-anchors',
  'default-theme/admonitions',
  'default-theme/code-related',
  'default-theme/twoslash',
  'default-theme/unocss',
  'default-theme/search',
  'default-theme/pwa',
  'default-theme/google-analytics',
  'blog-theme/configuration',
  'blog-theme/writing-posts',
  'blog-theme/features',
  'blog-theme/customization',
  'vite-plugin',
  'virtual-modules',
  'kitchen-sink',
] as const

const EXPECTED_RECORDS: Array<{
  slug: string
  name: string
  group: string
  success: string[]
  barNote?: string
  starter: string
  focusedFile: string
  guideHref: string | null
}> = [
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
    barNote: 'masonry / tags / RSS / timeline · OG PNG, Pagefind · giscus',
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
    slug: 'kitchen-sink',
    name: 'Kitchen sink',
    group: 'All features',
    success: ['as', 'degraded', 'observation'],
    barNote: 'coexistable Default Theme set',
    starter: 'Kitchen-sink starter',
    focusedFile: 'src/routes/+page.md',
    guideHref: null,
  },
]

describe('feature directory catalog', () => {
  it('records all 27 Entries from the spec', () => {
    expect(ALL_SLUGS).toHaveLength(27)
    for (const expected of EXPECTED_RECORDS) {
      const entry = entryBySlug(expected.slug)
      expect(entry, expected.slug).toMatchObject(expected)
    }
    expect(EXPECTED_RECORDS.map(record => record.slug)).toEqual([...ALL_SLUGS])
  })

  it('treats an unknown slug as not an Entry', () => {
    expect(entryBySlug('not-a-capability')).toBeUndefined()
    expect(entryBySlug('')).toBeUndefined()
    expect(entryBySlug(undefined)).toBeUndefined()
  })

  it('ships only Basic Writing in v1', () => {
    const shipping = shippingEntries()
    expect(shipping.map(entry => entry.slug)).toEqual([BASIC_WRITING_SLUG])
    expect(shipping[0]?.name).toBe('Basic Writing')
    expect(entryBySlug('markdown/frontmatter')).toBeDefined()
    expect(shipping.some(entry => entry.slug === 'markdown/frontmatter')).toBe(false)
  })

  it('registers only shipping Playground paths', () => {
    expect(isPlaygroundPathRegistered('/playground/markdown/basic-writing/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/markdown/basic-writing/')).toBe(true)
    expect(isPlaygroundPathRegistered('/bn/playground/markdown/basic-writing/')).toBe(true)
    expect(isPlaygroundPathRegistered('/playground/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/')).toBe(true)
    expect(isPlaygroundPathRegistered('/playground/markdown/frontmatter/')).toBe(false)
    expect(isPlaygroundPathRegistered('/playground/kitchen-sink/')).toBe(false)
    expect(isPlaygroundPathRegistered('/playground/not-a-capability/')).toBe(false)
    expect(isPlaygroundPathRegistered('/v/2026-09-03/playground/markdown/basic-writing/')).toBe(false)
  })

  it('builds locale-prefixed Entry URLs with English segments, a trailing slash, and no query string', () => {
    expect(entryUrl(BASIC_WRITING_SLUG)).toBe('/playground/markdown/basic-writing/')
    expect(entryUrl(BASIC_WRITING_SLUG, 'en')).toBe('/playground/markdown/basic-writing/')
    expect(entryUrl(BASIC_WRITING_SLUG, 'zh')).toBe('/zh/playground/markdown/basic-writing/')
    expect(entryUrl(BASIC_WRITING_SLUG, 'bn')).toBe('/bn/playground/markdown/basic-writing/')
    expect(entryUrl(KITCHEN_SINK_SLUG, 'zh')).toBe('/zh/playground/kitchen-sink/')
    expect(entryUrl(BASIC_WRITING_SLUG)).not.toContain('?')
    expect(entryUrl(BASIC_WRITING_SLUG)).not.toContain('#')
  })

  it('addresses GitHub import and Open in StackBlitz from the pinned tag plus Starter subdirectory', () => {
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(PINNED_STARTERS_TAG.length).toBeGreaterThan(0)
    expect(PLAYGROUND_STARTERS_REPO).toBe('SveltePress/playground-starters')
    expect(STARTER_SUBDIRECTORIES).toEqual({
      'Default Theme starter': 'default-theme',
      'TypeScript starter': 'typescript',
      'Blog starter': 'blog',
      'i18n starter': 'i18n',
      'Versions starter': 'versions',
      'Custom theme starter': 'custom-theme',
      'Kitchen-sink starter': 'kitchen-sink',
    })

    const basic = entryBySlug(BASIC_WRITING_SLUG)!
    expect(githubImportPath(basic)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/default-theme`,
    )
    expect(openInStackBlitzUrl(basic)).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/default-theme`,
    )
    expect(githubImportPath(basic)).not.toContain('/main/')
    expect(JSON.stringify(basic)).not.toMatch(/stackblitz\.com\/edit/)
    expect(basic).not.toHaveProperty('stackblitzProjectId')

    const kitchen = entryBySlug(KITCHEN_SINK_SLUG)!
    expect(githubImportPath(kitchen)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
    expect(openInStackBlitzUrl(kitchen)).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
  })

  it('omits Guide href for Custom theme and Kitchen sink', () => {
    expect(entryBySlug(CUSTOM_THEME_SLUG)?.guideHref).toBeNull()
    expect(entryBySlug(KITCHEN_SINK_SLUG)?.guideHref).toBeNull()
    expect(entryBySlug(BASIC_WRITING_SLUG)?.guideHref).toBe('/guide/markdown/basic-writing/')
    expect(entryBySlug(VIRTUAL_MODULES_SLUG)?.guideHref).toBe('/reference/site/')
  })

  it('localizes Entry names from the matching docs locale titles', () => {
    expect(localizedName(entryBySlug(BASIC_WRITING_SLUG)!, 'en')).toBe('Basic Writing')
    expect(localizedName(entryBySlug(BASIC_WRITING_SLUG)!, 'zh')).toBe('写作基础')
    expect(localizedName(entryBySlug(BASIC_WRITING_SLUG)!, 'bn')).toBe('হাতেখড়ি')
    expect(localizedName(entryBySlug('version-management')!, 'zh')).toBe('文档版本管理')
    expect(localizedName(entryBySlug('version-management')!, 'bn')).toBe('ডকুমেন্ট সংস্করণ ব্যবস্থাপনা')
    expect(localizedName(entryBySlug(CUSTOM_THEME_SLUG)!, 'zh')).toBe('自定义主题')
    expect(localizedName(entryBySlug(CUSTOM_THEME_SLUG)!, 'bn')).toBe('কাস্টম থিম')
    expect(localizedName(entryBySlug(KITCHEN_SINK_SLUG)!, 'zh')).toBe('Kitchen sink')
    expect(localizedName(entryBySlug(KITCHEN_SINK_SLUG)!, 'bn')).toBe('Kitchen sink')
    expect(localizedName(entryBySlug(KITCHEN_SINK_SLUG)!, 'en')).toBe('Kitchen sink')
    expect(localizedName(entryBySlug(VIRTUAL_MODULES_SLUG)!, 'zh')).toBe('虚拟模块')
    expect(localizedName(entryBySlug(VIRTUAL_MODULES_SLUG)!, 'bn')).toBe('ভার্চুয়াল মডিউল')
  })
})

describe('open in playground door', () => {
  it('shows on current shipping Guide and Reference Entry leaves', () => {
    expect(openInPlayground('/guide/markdown/basic-writing/')).toEqual({
      visible: true,
      href: '/playground/markdown/basic-writing/',
    })
    expect(openInPlayground('/zh/guide/markdown/basic-writing/')).toEqual({
      visible: true,
      href: '/zh/playground/markdown/basic-writing/',
    })
    expect(openInPlayground('/bn/guide/markdown/basic-writing/')).toEqual({
      visible: true,
      href: '/bn/playground/markdown/basic-writing/',
    })
  })

  it('hides on current Entry leaves that are not yet shipping', () => {
    expect(openInPlayground('/guide/default-theme/navbar/')).toEqual({
      visible: false,
      href: null,
    })
    expect(openInPlayground('/reference/vite-plugin/')).toEqual({
      visible: false,
      href: null,
    })
    expect(openInPlayground('/reference/site/')).toEqual({
      visible: false,
      href: null,
    })
  })

  it('hides on non-Entries, historical trees, and Custom theme', () => {
    for (const path of [
      '/guide/introduction/',
      '/guide/quick-start/',
      '/guide/themes/',
      '/guide/blog-theme/getting-started/',
      '/reference/default-theme/',
      '/reference/blog-theme/',
      '/reference/cli/',
      '/guide/custom-theme/',
      '/zh/guide/quick-start/',
    ]) {
      expect(openInPlayground(path), path).toEqual({ visible: false, href: null })
    }

    expect(openInPlayground('/v/2026-09-03/guide/markdown/basic-writing/')).toEqual({
      visible: false,
      href: null,
    })
    expect(openInPlayground('/zh/v/2026-09-03/guide/markdown/basic-writing/')).toEqual({
      visible: false,
      href: null,
    })
    expect(openInPlayground('/bn/v/2026-08-28/reference/vite-plugin/')).toEqual({
      visible: false,
      href: null,
    })
  })

  it('coalesces virtual-module reference leaves onto the Virtual modules Entry URL', () => {
    expect(openInPlaygroundHref('/reference/site/')).toBe('/playground/virtual-modules/')
    expect(openInPlaygroundHref('/zh/reference/locale/')).toBe('/zh/playground/virtual-modules/')
    expect(openInPlaygroundHref('/bn/reference/versions/')).toBe('/bn/playground/virtual-modules/')
    expect(openInPlaygroundHref('/reference/vite-plugin/')).toBe('/playground/vite-plugin/')
    expect(openInPlayground('/reference/site/')).toEqual({ visible: false, href: null })
    expect(openInPlayground('/zh/reference/locale/')).toEqual({ visible: false, href: null })
    expect(openInPlayground('/reference/vite-plugin/')).toEqual({ visible: false, href: null })
  })
})
