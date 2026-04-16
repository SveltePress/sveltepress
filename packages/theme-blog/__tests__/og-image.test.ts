import { describe, expect, it } from 'vitest'
import { renderOgImage } from '../src/og-image.js'

describe('renderOgImage', () => {
  it('produces a PNG buffer', async () => {
    const buf = await renderOgImage({
      title: 'Hello world',
      subtitle: 'A demo post',
      theme: { primary: '#fb923c', bg: '#1a0a00', text: '#fff7ed' },
    })
    // PNG magic number: 89 50 4E 47
    expect(buf[0]).toBe(0x89)
    expect(buf[1]).toBe(0x50)
    expect(buf[2]).toBe(0x4E)
    expect(buf[3]).toBe(0x47)
    expect(buf.byteLength).toBeGreaterThan(5000)
  }, 20000)
})
