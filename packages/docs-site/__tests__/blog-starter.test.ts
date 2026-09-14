import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BLOG_CONFIGURATION_SLUG,
  BLOG_CUSTOMIZATION_SLUG,
  BLOG_FEATURES_SLUG,
  BLOG_WRITING_POSTS_SLUG,
  entryBySlug,
  entryUrl,
  githubImportPath,
  isPlaygroundPathRegistered,
  KITCHEN_SINK_SLUG,
  localizedName,
  openInPlayground,
  openInStackBlitzUrl,
  PINNED_STARTERS_TAG,
  shippingEntries,
  STARTER_SUBDIRECTORIES,
} from '../src/lib/playground/catalog.ts'
import { hostedEditorEmbedRequest } from '../src/lib/playground/hosted-editor.ts'
import { shippingGroups } from '../src/lib/playground/shipping.ts'

const BLOG_SLUGS = [
  BLOG_CONFIGURATION_SLUG,
  BLOG_WRITING_POSTS_SLUG,
  BLOG_FEATURES_SLUG,
  BLOG_CUSTOMIZATION_SLUG,
] as const

const BLOG_RECORDS = [
  {
    slug: BLOG_CONFIGURATION_SLUG,
    name: 'Configuration',
    success: ['as'] as const,
    focusedFile: 'vite.config.ts',
    guideHref: '/guide/blog-theme/configuration/',
  },
  {
    slug: BLOG_WRITING_POSTS_SLUG,
    name: 'Writing posts',
    success: ['as'] as const,
    focusedFile: 'src/posts/hello-sveltepress.md',
    guideHref: '/guide/blog-theme/writing-posts/',
  },
  {
    slug: BLOG_FEATURES_SLUG,
    name: 'Features',
    success: ['as', 'degraded', 'observation'] as const,
    barNote: 'masonry / tags / RSS / timeline · OG PNG, Pagefind · giscus',
    focusedFile: 'src/posts/editorial-showcase.md',
    guideHref: '/guide/blog-theme/features/',
  },
  {
    slug: BLOG_CUSTOMIZATION_SLUG,
    name: 'Customisation',
    success: ['as'] as const,
    focusedFile: 'src/app.css',
    guideHref: '/guide/blog-theme/customization/',
  },
] as const

describe('blog starter and Blog theme Entries', () => {
  it('ships Configuration, Writing posts, Features, and Customisation from the Blog starter', () => {
    const shipping = shippingEntries()
    const slugs = shipping.map(entry => entry.slug)

    for (const record of BLOG_RECORDS) {
      expect(slugs).toContain(record.slug)
      const entry = entryBySlug(record.slug)!
      expect(entry.group).toBe('Blog theme features')
      expect(entry.starter).toBe('Blog starter')
      expect(entry).toMatchObject(record)
    }

    expect(shippingGroups()).toContain('Blog theme features')
    expect(shipping.some(entry => entry.slug === KITCHEN_SINK_SLUG)).toBe(true)
    expect(shipping.some(entry => entry.starter === 'Kitchen-sink starter')).toBe(true)
  })

  it('registers locale-prefixed Blog Entry URLs and leaves getting-started unregistered', () => {
    for (const slug of BLOG_SLUGS) {
      expect(entryUrl(slug)).toBe(`/playground/${slug}/`)
      expect(entryUrl(slug, 'zh')).toBe(`/zh/playground/${slug}/`)
      expect(entryUrl(slug, 'bn')).toBe(`/bn/playground/${slug}/`)
      expect(entryUrl(slug)).not.toContain('?')
      expect(isPlaygroundPathRegistered(`/playground/${slug}/`)).toBe(true)
      expect(isPlaygroundPathRegistered(`/zh/playground/${slug}/`)).toBe(true)
      expect(isPlaygroundPathRegistered(`/bn/playground/${slug}/`)).toBe(true)
      expect(isPlaygroundPathRegistered(`/v/2026-09-03/playground/${slug}/`)).toBe(false)
    }

    expect(isPlaygroundPathRegistered('/playground/blog-theme/getting-started/')).toBe(false)
    expect(isPlaygroundPathRegistered('/playground/kitchen-sink/')).toBe(true)
  })

  it('addresses GitHub import and Open in StackBlitz at the pinned tag plus blog', () => {
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(STARTER_SUBDIRECTORIES['Blog starter']).toBe('blog')

    for (const slug of BLOG_SLUGS) {
      const entry = entryBySlug(slug)!
      expect(githubImportPath(entry)).toBe(
        `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/blog`,
      )
      expect(openInStackBlitzUrl(entry)).toBe(
        `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/blog`,
      )
      expect(githubImportPath(entry)).not.toContain('/main/')
      expect(githubImportPath(entry)).not.toContain('example-blog')
      expect(githubImportPath(entry)).not.toContain('kitchen-sink')
      expect(JSON.stringify(entry)).not.toMatch(/stackblitz.com\/edit/)
      expect(entry).not.toHaveProperty('stackblitzProjectId')
    }
  })

  it('auto-boots the Hosted editor as authored at each Blog Entry Focused file', () => {
    for (const record of BLOG_RECORDS) {
      const entry = entryBySlug(record.slug)!
      const request = hostedEditorEmbedRequest(entry, 'light')
      expect(request.method).toBe('embedGithubProject')
      expect(request.projectPath).toBe(
        `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/blog`,
      )
      expect(request.options.openFile).toBe(record.focusedFile)
      expect(request.options.clickToLoad).toBe(false)
      expect(JSON.stringify(request)).not.toMatch(/embedProject/)
      expect(JSON.stringify(request)).not.toMatch(/\/run/)
    }
  })

  it('shows Open in Playground on Blog Guide leaves and hides it on getting-started', () => {
    expect(openInPlayground('/guide/blog-theme/configuration/')).toEqual({
      visible: true,
      href: '/playground/blog-theme/configuration/',
    })
    expect(openInPlayground('/zh/guide/blog-theme/writing-posts/')).toEqual({
      visible: true,
      href: '/zh/playground/blog-theme/writing-posts/',
    })
    expect(openInPlayground('/bn/guide/blog-theme/features/')).toEqual({
      visible: true,
      href: '/bn/playground/blog-theme/features/',
    })
    expect(openInPlayground('/guide/blog-theme/customization/')).toEqual({
      visible: true,
      href: '/playground/blog-theme/customization/',
    })
    expect(openInPlayground('/guide/blog-theme/getting-started/')).toEqual({
      visible: false,
      href: null,
    })
    expect(openInPlayground('/zh/guide/blog-theme/getting-started/')).toEqual({
      visible: false,
      href: null,
    })
    expect(openInPlayground('/bn/guide/blog-theme/getting-started/')).toEqual({
      visible: false,
      href: null,
    })
  })

  it('localizes Blog theme Entry names from the matching docs locale titles', () => {
    expect(localizedName(entryBySlug(BLOG_CONFIGURATION_SLUG)!, 'zh')).toBe('配置')
    expect(localizedName(entryBySlug(BLOG_CONFIGURATION_SLUG)!, 'bn')).toBe('কনফিগারেশন')
    expect(localizedName(entryBySlug(BLOG_WRITING_POSTS_SLUG)!, 'zh')).toBe('写文章')
    expect(localizedName(entryBySlug(BLOG_WRITING_POSTS_SLUG)!, 'bn')).toBe('পোস্ট লেখা')
    expect(localizedName(entryBySlug(BLOG_FEATURES_SLUG)!, 'zh')).toBe('特性')
    expect(localizedName(entryBySlug(BLOG_FEATURES_SLUG)!, 'bn')).toBe('ফিচারসমূহ')
    expect(localizedName(entryBySlug(BLOG_CUSTOMIZATION_SLUG)!, 'zh')).toBe('自定义')
    expect(localizedName(entryBySlug(BLOG_CUSTOMIZATION_SLUG)!, 'bn')).toBe('কাস্টমাইজেশন')
  })

  it('registers Blog Entry URL files in EN, ZH, and BN', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    for (const slug of BLOG_SLUGS) {
      expect(existsSync(resolve(routes, `playground/${slug}/+page.svelte`))).toBe(true)
      expect(existsSync(resolve(routes, `zh/playground/${slug}/+page.svelte`))).toBe(true)
      expect(existsSync(resolve(routes, `bn/playground/${slug}/+page.svelte`))).toBe(true)
    }
    expect(existsSync(resolve(routes, 'playground/blog-theme/getting-started/+page.svelte'))).toBe(false)
    expect(existsSync(resolve(routes, 'playground/kitchen-sink/+page.svelte'))).toBe(true)
  })
})
