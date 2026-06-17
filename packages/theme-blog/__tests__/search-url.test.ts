import { describe, expect, it } from 'vitest'
import { withBase } from '../src/search-url.js'

describe('withBase', () => {
  it('prefixes root-relative Pagefind result URLs with the SvelteKit base', () => {
    expect(withBase('/posts/hello-sveltepress/', '/sveltepress/blog-demo')).toBe(
      '/sveltepress/blog-demo/posts/hello-sveltepress/',
    )
  })

  it('does not prefix a URL that already includes the base', () => {
    expect(
      withBase('/sveltepress/blog-demo/tags/tooling/', '/sveltepress/blog-demo'),
    ).toBe('/sveltepress/blog-demo/tags/tooling/')
  })

  it('leaves URLs unchanged when the app has no base path', () => {
    expect(withBase('/posts/hello-sveltepress/', '')).toBe(
      '/posts/hello-sveltepress/',
    )
  })

  it('leaves absolute, protocol-relative, scheme, and hash URLs unchanged', () => {
    const base = '/sveltepress/blog-demo'

    expect(withBase('https://example.com/post/', base)).toBe(
      'https://example.com/post/',
    )
    expect(withBase('//example.com/post/', base)).toBe('//example.com/post/')
    expect(withBase('mailto:demo@example.com', base)).toBe(
      'mailto:demo@example.com',
    )
    expect(withBase('#section', base)).toBe('#section')
  })

  it('prefixes simple relative URLs', () => {
    expect(withBase('posts/hello-sveltepress/', '/sveltepress/blog-demo/')).toBe(
      '/sveltepress/blog-demo/posts/hello-sveltepress/',
    )
  })
})
