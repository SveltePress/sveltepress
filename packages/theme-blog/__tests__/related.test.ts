import type { BlogPostMeta } from '../src/types.js'
import { describe, expect, it } from 'vitest'
import { computeRelated } from '../src/related.js'

function m(overrides: Partial<BlogPostMeta> = {}): BlogPostMeta {
  return {
    slug: 'x',
    title: 'X',
    date: '2026-04-10',
    tags: [],
    excerpt: '',
    readingTime: 1,
    ...overrides,
  }
}

describe('computeRelated', () => {
  it('excludes the current post', () => {
    const cur = m({ slug: 'a', tags: ['x'] })
    const all = [cur, m({ slug: 'b', tags: ['x'] })]
    expect(computeRelated(all, cur).map(p => p.slug)).toEqual(['b'])
  })

  it('ranks shared tags over same category over same year', () => {
    const cur = m({
      slug: 'cur',
      tags: ['a', 'b'],
      category: 'cat1',
      date: '2026-01-01',
    })
    const all = [
      cur,
      m({ slug: 'same-year', tags: [], category: undefined, date: '2026-05-01' }),
      m({ slug: 'one-tag', tags: ['a'], date: '2025-01-01' }),
      m({ slug: 'same-cat', tags: [], category: 'cat1', date: '2025-01-01' }),
      m({ slug: 'two-tags', tags: ['a', 'b'], date: '2025-01-01' }),
    ]
    const out = computeRelated(all, cur).map(p => p.slug)
    expect(out).toEqual(['two-tags', 'one-tag', 'same-cat'])
  })

  it('returns at most N results (default 3)', () => {
    const cur = m({ slug: 'cur', tags: ['x'] })
    const all = [
      cur,
      ...Array.from({ length: 5 }, (_, i) => m({ slug: `p${i}`, tags: ['x'] })),
    ]
    expect(computeRelated(all, cur)).toHaveLength(3)
  })

  it('returns empty when no candidates share anything', () => {
    const cur = m({ slug: 'cur', tags: ['a'], category: 'c1', date: '2026-01-01' })
    const all = [
      cur,
      m({ slug: 'unrelated', tags: ['z'], category: 'c2', date: '2020-01-01' }),
    ]
    expect(computeRelated(all, cur)).toEqual([])
  })

  it('respects custom limit', () => {
    const cur = m({ slug: 'cur', tags: ['x'] })
    const all = [
      cur,
      ...Array.from({ length: 5 }, (_, i) => m({ slug: `p${i}`, tags: ['x'] })),
    ]
    expect(computeRelated(all, cur, 2)).toHaveLength(2)
  })
})
