import type { ParsedPost } from '../src/parse-post.js'
import { describe, expect, it } from 'vitest'
import { buildIndex } from '../src/build-index.js'

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
    expect(index.meta).toHaveLength(1)
    expect(index.meta[0].slug).toBe('pub')
  })

  it('sorts by date desc in both posts and meta', () => {
    const posts = [
      makePost({ slug: 'older', date: '2026-03-01' }),
      makePost({ slug: 'newer', date: '2026-04-10' }),
    ]
    const index = buildIndex(posts)
    expect(index.posts[0].slug).toBe('newer')
    expect(index.meta[0].slug).toBe('newer')
  })

  it('strips contentHtml from meta entries', () => {
    const posts = [makePost({ slug: 'a', contentHtml: '<p>big html</p>' })]
    const index = buildIndex(posts)
    expect('contentHtml' in index.meta[0]).toBe(false)
    expect(index.posts[0].contentHtml).toBe('<p>big html</p>')
  })

  it('builds metaBySlug for O(1) slug lookup', () => {
    const posts = [makePost({ slug: 'a' }), makePost({ slug: 'b' })]
    const index = buildIndex(posts)
    expect(index.metaBySlug.a.slug).toBe('a')
    expect(index.metaBySlug.b.slug).toBe('b')
  })

  it('builds tagCounts sorted desc by count', () => {
    const posts = [
      makePost({ slug: 'a', tags: ['x', 'y'] }),
      makePost({ slug: 'b', tags: ['x'] }),
      makePost({ slug: 'c', tags: ['x'] }),
    ]
    const index = buildIndex(posts)
    expect(index.tagCounts[0]).toEqual({ name: 'x', count: 3 })
    expect(index.tagCounts[1]).toEqual({ name: 'y', count: 1 })
  })

  it('tagPosts stores meta only (no contentHtml)', () => {
    const posts = [makePost({ slug: 'a', tags: ['x'], contentHtml: '<p>big</p>' })]
    const index = buildIndex(posts)
    expect('contentHtml' in index.tagPosts.x[0]).toBe(false)
  })

  it('categoryCounts mirror tagCounts shape', () => {
    const posts = [
      makePost({ slug: 'a', category: 'Eng' }),
      makePost({ slug: 'b', category: 'Eng' }),
    ]
    const index = buildIndex(posts)
    expect(index.categoryCounts[0]).toEqual({ name: 'Eng', count: 2 })
  })
})
