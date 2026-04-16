import type { BlogPost } from '../src/types.js'
import { describe, expect, it } from 'vitest'
import { generateRss } from '../src/rss.js'

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'test-post',
    title: 'Test Post',
    date: '2026-04-10',
    tags: [],
    excerpt: 'Test excerpt.',
    readingTime: 1,
    contentHtml: '<p>content</p>',
    ...overrides,
  }
}

describe('generateRss', () => {
  it('outputs valid RSS 2.0 wrapper', () => {
    const xml = generateRss([], { title: 'My Blog', base: 'https://example.com' })
    expect(xml).toContain('<rss version="2.0">')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('<title>My Blog</title>')
    expect(xml).toContain('<link>https://example.com</link>')
    expect(xml).toContain('</channel>')
    expect(xml).toContain('</rss>')
  })

  it('includes an <item> per post', () => {
    const posts = [makePost(), makePost({ slug: 'second', title: 'Second' })]
    const xml = generateRss(posts, { title: 'Blog', base: 'https://example.com' })
    expect(xml.match(/<item>/g)).toHaveLength(2)
  })

  it('item contains title, link, pubDate, description', () => {
    const xml = generateRss(
      [makePost({ slug: 'hello', title: 'Hello', excerpt: 'An excerpt.' })],
      { title: 'Blog', base: 'https://example.com' },
    )
    expect(xml).toContain('<title>Hello</title>')
    expect(xml).toContain('<link>https://example.com/posts/hello</link>')
    expect(xml).toContain('<description>An excerpt.</description>')
  })

  it('respects limit option', () => {
    const posts = Array.from({ length: 25 }, (_, i) => makePost({
      slug: `post-${i}`,
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    }))
    const xml = generateRss(posts, { title: 'Blog', base: 'https://example.com', limit: 10 })
    expect(xml.match(/<item>/g)).toHaveLength(10)
  })

  it('escapes XML special characters in title and excerpt', () => {
    const xml = generateRss(
      [makePost({ slug: 'escape-test', title: 'A & B <Test>', excerpt: '"quoted" & <special>' })],
      { title: 'Blog', base: 'https://example.com' },
    )
    expect(xml).toContain('<title>A &amp; B &lt;Test&gt;</title>')
    expect(xml).toContain('<description>&quot;quoted&quot; &amp; &lt;special&gt;</description>')
  })
})
