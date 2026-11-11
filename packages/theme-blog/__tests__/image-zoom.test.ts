import { describe, expect, it } from 'vitest'
import {
  flipTransform,
  isVectorImage,
  zoomMargin,
  zoomTarget,
} from '../src/image-zoom'

const viewport = { width: 1280, height: 800 }

describe('zoomTarget', () => {
  it('fills the viewport with a vector image, centred', () => {
    const rect = zoomTarget({
      source: { width: 640, height: 320 },
      natural: null,
      viewport,
      margin: 40,
    })
    // Width is the limit: 1280 - 80 = 1200, height follows the 2:1 ratio.
    expect(rect).toEqual({ left: 40, top: 40 + (720 - 600) / 2, width: 1200, height: 600 })
  })

  it('stops a raster image at its intrinsic size', () => {
    const rect = zoomTarget({
      source: { width: 400, height: 300 },
      natural: { width: 800, height: 600 },
      viewport,
      margin: 40,
    })
    expect(rect.width).toBe(800)
    expect(rect.height).toBe(600)
    expect(rect.left).toBe((1280 - 800) / 2)
    expect(rect.top).toBe(40 + (720 - 600) / 2)
  })

  it('keeps a raster image that is already shown above its intrinsic size', () => {
    const rect = zoomTarget({
      source: { width: 600, height: 300 },
      natural: { width: 200, height: 100 },
      viewport,
      margin: 40,
    })
    expect(rect.width).toBe(600)
    expect(rect.height).toBe(300)
  })

  it('shrinks an image that is taller than the viewport', () => {
    const rect = zoomTarget({
      source: { width: 600, height: 1200 },
      natural: { width: 1200, height: 2400 },
      viewport,
      margin: 40,
    })
    expect(rect.height).toBe(720)
    expect(rect.width).toBe(360)
    expect(rect.top).toBe(40)
  })

  it('keeps the bottom space free for the caption', () => {
    const rect = zoomTarget({
      source: { width: 600, height: 600 },
      natural: null,
      viewport,
      margin: 40,
      bottom: 60,
    })
    expect(rect.height).toBe(800 - 80 - 60)
    expect(rect.top).toBe(40)
    expect(rect.top + rect.height).toBe(800 - 40 - 60)
  })
})

describe('flipTransform', () => {
  it('maps the zoomed box back onto the source box', () => {
    const from = { left: 100, top: 200, width: 300, height: 150 }
    const to = { left: 40, top: 50, width: 1200, height: 600 }
    expect(flipTransform(from, to)).toBe('translate(60px, 150px) scale(0.25, 0.25)')
  })
})

describe('isVectorImage', () => {
  it('detects SVG sources', () => {
    expect(isVectorImage('/covers/diff.svg', 300)).toBe(true)
    expect(isVectorImage('https://x.dev/a.SVG?v=2', 300)).toBe(true)
    expect(isVectorImage('/a.svg#frag', 300)).toBe(true)
    expect(isVectorImage('data:image/svg+xml;utf8,<svg/>', 300)).toBe(true)
  })

  it('treats an image without an intrinsic size as vector', () => {
    expect(isVectorImage('/photo.png', 0)).toBe(true)
  })

  it('treats raster images as raster', () => {
    expect(isVectorImage('/photo.png', 800)).toBe(false)
    expect(isVectorImage('/svg-tips.jpg', 800)).toBe(false)
  })
})

describe('zoomMargin', () => {
  it('uses a tighter gap on phones', () => {
    expect(zoomMargin(375)).toBe(16)
    expect(zoomMargin(1280)).toBe(40)
  })
})
