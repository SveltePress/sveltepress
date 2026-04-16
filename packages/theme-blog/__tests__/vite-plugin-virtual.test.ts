import { describe, expect, it } from 'vitest'
import { buildVirtualModules } from '../src/virtual-modules.js'

function makePost(slug: string, extra: any = {}) {
  return {
    slug,
    title: slug,
    date: '2026-04-10',
    tags: extra.tags ?? [],
    category: extra.category,
    excerpt: 'x',
    readingTime: 1,
    contentHtml: `<p>${slug}</p>`,
    draft: false,
    ...extra,
  }
}

describe('virtual module generation', () => {
  it('emits meta module without contentHtml', () => {
    const modules = buildVirtualModules([makePost('a')])
    expect(modules.metaModule).toContain('"slug":"a"')
    expect(modules.metaModule).not.toContain('contentHtml')
  })

  it('emits per-slug post module with contentHtml', () => {
    const modules = buildVirtualModules([makePost('a')])
    const m = modules.postModule('a')
    expect(m).toContain('<p>a</p>')
    expect(m).toContain('"slug":"a"')
  })

  it('returns null for unknown slug', () => {
    const modules = buildVirtualModules([makePost('a')])
    expect(modules.postModule('missing')).toBeNull()
  })

  it('emits per-tag meta module', () => {
    const modules = buildVirtualModules([makePost('a', { tags: ['x'] })])
    expect(modules.tagModule('x')).toContain('"slug":"a"')
    expect(modules.tagModule('unknown')).toBeNull()
  })

  it('tags-index module is sorted by count desc', () => {
    const modules = buildVirtualModules([
      makePost('a', { tags: ['x', 'y'] }),
      makePost('b', { tags: ['x'] }),
    ])
    expect(modules.tagsIndexModule).toMatch(/"name":"x","count":2.*"name":"y","count":1/)
  })
})
