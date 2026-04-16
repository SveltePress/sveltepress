import { describe, expect, it } from 'vitest'
import { readingTime } from '../src/reading-time.js'

describe('readingTime', () => {
  it('returns 1 for very short text', () => {
    expect(readingTime('Hello world')).toBe(1)
  })

  it('returns 1 for exactly 200 words', () => {
    const text = Array.from({ length: 200 }, (_, i) => `word${i}`).join(' ')
    expect(readingTime(text)).toBe(1)
  })

  it('returns 2 for 201 words', () => {
    const text = Array.from({ length: 201 }, (_, i) => `word${i}`).join(' ')
    expect(readingTime(text)).toBe(2)
  })

  it('returns 5 for 900 words', () => {
    const text = Array.from({ length: 900 }, (_, i) => `word${i}`).join(' ')
    expect(readingTime(text)).toBe(5)
  })

  it('ignores markdown syntax tokens', () => {
    const md = '# Heading\n\n**bold** and `code` and [link](http://x.com)'
    expect(readingTime(md)).toBe(1)
  })
})
