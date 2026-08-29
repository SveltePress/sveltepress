import { Buffer } from 'node:buffer'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  assertPngDimensions,
  CAPTURE_LAYOUT,
  parseArgs,
  readPngDimensions,
  STABLE_SVG_TIME_SECONDS,
} from '../../../scripts/capture-site-screenshot.mjs'

function pngHeader(width, height) {
  const buffer = Buffer.alloc(24)
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(buffer)
  buffer.writeUInt32BE(width, 16)
  buffer.writeUInt32BE(height, 20)
  return buffer
}

describe('capture site screenshot arguments', () => {
  it('uses stable production defaults', () => {
    const options = parseArgs([], '/repo', {})

    expect(options).toMatchObject({
      url: 'https://sveltepress.site/',
      output: path.resolve('/repo/assets/site.png'),
      readySelector: 'main h1',
      timeout: 30_000,
    })
  })

  it('accepts an explicit local URL, output, selector, timeout, and browser', () => {
    const options = parseArgs(
      [
        '--url',
        'http://localhost:5173/',
        '--output',
        'tmp/site.png',
        '--ready-selector',
        '[data-ready]',
        '--timeout',
        '45000',
        '--browser-path',
        '/Applications/Chromium',
      ],
      '/repo',
      {},
    )

    expect(options).toEqual({
      browserPath: '/Applications/Chromium',
      help: false,
      output: path.resolve('/repo/tmp/site.png'),
      readySelector: '[data-ready]',
      timeout: 45_000,
      url: 'http://localhost:5173/',
    })
  })

  it('ignores the pnpm argument separator', () => {
    const options = parseArgs(
      ['--', '--url', 'http://localhost:4173/'],
      '/repo',
      {},
    )

    expect(options.url).toBe('http://localhost:4173/')
  })

  it('rejects unsupported URLs and invalid timeouts', () => {
    expect(() => parseArgs(['--url', 'file:///tmp/site.html'], '/repo', {})).toThrow(
      'http:// or https://',
    )
    expect(() => parseArgs(['--timeout', '0'], '/repo', {})).toThrow(
      'positive integer',
    )
  })
})

describe('capture site screenshot layout', () => {
  it('preserves the README composite dimensions and exact mobile placement', () => {
    expect(CAPTURE_LAYOUT.canvas).toEqual({ width: 2048, height: 1102 })
    expect(CAPTURE_LAYOUT.mobile.x + CAPTURE_LAYOUT.mobile.width).toBe(
      CAPTURE_LAYOUT.canvas.width,
    )
    expect(CAPTURE_LAYOUT.mobile.y + CAPTURE_LAYOUT.mobile.height).toBe(
      CAPTURE_LAYOUT.canvas.height,
    )
    expect(CAPTURE_LAYOUT.desktop.width).toBeGreaterThan(CAPTURE_LAYOUT.mobile.x)
  })

  it('freezes SVG animations after the longest finite site icon transition', () => {
    expect(STABLE_SVG_TIME_SECONDS).toBeGreaterThanOrEqual(2.7)
  })
})

describe('pNG validation', () => {
  it('reads dimensions from a PNG IHDR header', () => {
    expect(readPngDimensions(pngHeader(2048, 1102))).toEqual({
      width: 2048,
      height: 1102,
    })
  })

  it('rejects non-PNG data and unexpected dimensions', () => {
    expect(() => readPngDimensions(Buffer.alloc(24))).toThrow('valid PNG')
    expect(() => assertPngDimensions(pngHeader(10, 10), 2048, 1102)).toThrow(
      '10x10',
    )
  })
})
