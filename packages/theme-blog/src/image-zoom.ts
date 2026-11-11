/**
 * Geometry for the click-to-zoom of post images (see
 * `components/ImageZoom.svelte`): where the zoomed image ends up, and the
 * FLIP transform that makes it start from where it sat in the post.
 */

export interface ZoomRect {
  left: number
  top: number
  width: number
  height: number
}

export interface ZoomSize {
  width: number
  height: number
}

export interface ZoomTargetOptions {
  /** The image's size in the post right now. */
  source: ZoomSize
  /** The image's intrinsic size; `null` for vector images, which scale freely. */
  natural: ZoomSize | null
  /** The area the zoomed image is laid out in (the viewport). */
  viewport: ZoomSize
  /** Gap kept on every side of the zoomed image. */
  margin: number
  /** Extra space kept free under the image, for the caption. */
  bottom?: number
}

/** Gap around the zoomed image: tighter on phones. */
export function zoomMargin(viewportWidth: number): number {
  return viewportWidth < 640 ? 16 : 40
}

/**
 * Vector images have no useful intrinsic size (an SVG without width/height
 * reports 0 or a small default), so they are allowed to fill the viewport.
 */
export function isVectorImage(src: string, naturalWidth: number): boolean {
  if (!naturalWidth)
    return true
  return /\.svgz?(?:[?#]|$)/i.test(src) || /^data:image\/svg\+xml[;,]/i.test(src)
}

/**
 * The zoomed image's box: as large as fits the viewport (less the margin and
 * the caption space), keeping the aspect ratio, centred. Raster images stop
 * at their intrinsic size so they don't blur, but never end up smaller than
 * they already are in the post unless the viewport is too small for that.
 */
export function zoomTarget({
  source,
  natural,
  viewport,
  margin,
  bottom = 0,
}: ZoomTargetOptions): ZoomRect {
  const availWidth = Math.max(viewport.width - margin * 2, 1)
  const availHeight = Math.max(viewport.height - margin * 2 - bottom, 1)
  const maxWidth = natural ? Math.max(source.width, natural.width) : Infinity
  const maxHeight = natural
    ? Math.max(source.height, natural.height)
    : Infinity
  const scale = Math.min(
    Math.min(maxWidth, availWidth) / source.width,
    Math.min(maxHeight, availHeight) / source.height,
  )
  const width = source.width * scale
  const height = source.height * scale
  return {
    left: (viewport.width - width) / 2,
    top: margin + (availHeight - height) / 2,
    width,
    height,
  }
}

/**
 * The transform that draws an element laid out at `to` over the box `from`
 * (with `transform-origin: 0 0`). Animating from it to `none` moves the
 * element from `from` to `to`.
 */
export function flipTransform(from: ZoomRect, to: ZoomRect): string {
  const x = from.left - to.left
  const y = from.top - to.top
  const sx = from.width / to.width
  const sy = from.height / to.height
  return `translate(${x}px, ${y}px) scale(${sx}, ${sy})`
}
