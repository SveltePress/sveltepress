import type { ParsedPost } from '../src/parse-post.js'
import { describe, expect, it } from 'vitest'
import { buildIndex, toVirtualModuleCode } from '../src/build-index.js'

function makePost(overrides: Partial<ParsedPost> = {}): ParsedPost {
  return {
    slug: 'test',
    title: 'Test',
    date: '2026-04-10',
    tags: [],
    excerpt: 'excerpt',
    readingTime: 1,
    contentHtml: '<p>content</p>',
    draft: false,
    ...overrides,
  }
}

describe('buildIndex', () => {
  it('excludes draft posts', () => {
    const posts = [makePost({ draft: true }), makePost({ slug: 'pub', draft: false })]
    const index = buildIndex(posts)
    expect(index.posts).toHaveLength(1)
    expect(index.posts[0].slug).toBe('pub')
  })

  it('sorts posts by date descending', () => {
    const posts = [
      makePost({ slug: 'older', date: '2026-03-01' }),
      makePost({ slug: 'newer', date: '2026-04-10' }),
    ]
    const index = buildIndex(posts)
    expect(index.posts[0].slug).toBe('newer')
    expect(index.posts[1].slug).toBe('older')
  })

  it('builds tag index', () => {
    const posts = [
      makePost({ slug: 'a', tags: ['Svelte', 'Tools'] }),
      makePost({ slug: 'b', tags: ['Svelte'] }),
    ]
    const index = buildIndex(posts)
    expect(index.tags.Svelte).toHaveLength(2)
    expect(index.tags.Tools).toHaveLength(1)
  })

  it('builds category index', () => {
    const posts = [
      makePost({ slug: 'a', category: 'Engineering' }),
      makePost({ slug: 'b', category: 'Engineering' }),
      makePost({ slug: 'c', category: 'Design' }),
    ]
    const index = buildIndex(posts)
    expect(index.categories.Engineering).toHaveLength(2)
    expect(index.categories.Design).toHaveLength(1)
  })

  it('generates valid JS for virtual modules', () => {
    const posts = [makePost({ slug: 'a', tags: ['Svelte'] })]
    const index = buildIndex(posts)
    const { postsModule, tagsModule, categoriesModule } = toVirtualModuleCode(index)
    expect(postsModule).toContain('"slug":"a"')
    expect(tagsModule).toContain('"Svelte"')
    expect(categoriesModule).toBe('export const categories = {}')
  })
})
