<!-- src/components/ImageZoom.svelte -->
<!--
  Click-to-zoom for the images in a post. Clicking an image (or Enter / Space
  on it) opens it full screen in a modal <dialog>: a copy of the image grows
  out of the spot it holds in the post and shrinks back there on close (FLIP
  with the Web Animations API), while the original is hidden so the image
  seems to lift out of the page. Closes on a click anywhere, Esc, the close
  button, or once the page scrolls.

  Images inside links, inside the project's demos and live code, or under a
  `data-no-zoom` element are left alone.
-->
<script lang="ts">
  import type { ZoomRect } from '../image-zoom.js'
  import { onMount, tick } from 'svelte'
  import {
    flipTransform,
    isVectorImage,
    zoomMargin,
    zoomTarget,
  } from '../image-zoom.js'

  interface Zoomed {
    img: HTMLImageElement
    src: string
    alt: string
    caption: string
  }

  const IMAGES = '.sp-post-content img'
  const SKIP = 'a, .sp-demo, .sp-live-code__demo, [data-no-zoom]'
  const ZOOMABLE = 'sp-zoomable'
  const SOURCE = 'sp-zoom-source'
  // Same motion as the card ↔ post view transition (GlobalLayout).
  const DURATION = 420
  const EASING = 'cubic-bezier(0.2, 0, 0.2, 1)'
  const FADE = 160
  // Scrolling the page further than this closes the zoom.
  const SCROLL_CLOSE = 40
  // Gap between the zoomed image and its caption.
  const CAPTION_GAP = 12

  let zoomed = $state.raw<Zoomed | null>(null)
  let dialog = $state<HTMLDialogElement>()
  let image = $state<HTMLImageElement>()
  let backdrop = $state<HTMLElement>()
  let chrome = $state<HTMLElement>()
  let caption = $state<HTMLElement>()

  let target: ZoomRect | null = null
  let radius = 0
  let scrollStart = 0
  let closing = false
  let running: Animation[] = []

  const reducedMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  function stop() {
    for (const animation of running) animation.cancel()
    running = []
  }

  // Lays the zoomed copy (and its caption) out in the viewport.
  function place(z: Zoomed) {
    if (!dialog || !image) return
    const { width, height } = z.img.getBoundingClientRect()
    const viewport = { width: dialog.clientWidth, height: dialog.clientHeight }
    const { naturalWidth, naturalHeight } = z.img
    target = zoomTarget({
      source: { width, height },
      natural: isVectorImage(z.src, naturalWidth)
        ? null
        : { width: naturalWidth, height: naturalHeight },
      viewport,
      margin: zoomMargin(viewport.width),
      bottom: caption ? caption.offsetHeight + CAPTION_GAP : 0,
    })
    Object.assign(image.style, {
      left: `${target.left}px`,
      top: `${target.top}px`,
      width: `${target.width}px`,
      height: `${target.height}px`,
      borderRadius: `${radius}px`,
    })
    if (caption)
      caption.style.top = `${target.top + target.height + CAPTION_GAP}px`
  }

  async function open(img: HTMLImageElement) {
    if (zoomed || !dialog) return
    const rect = img.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const figcaption = img.closest('figure')?.querySelector('figcaption')
    const z: Zoomed = {
      img,
      src: img.currentSrc || img.src,
      alt: img.alt,
      caption: figcaption?.textContent?.trim() ?? '',
    }
    zoomed = z
    await tick()
    // The copy reuses the image the post already loaded; wait until it can
    // be drawn so the first frame of the animation isn't empty.
    await image?.decode().catch(() => {})
    if (zoomed !== z) return
    if (!dialog || !image || !backdrop || !chrome) {
      zoomed = null
      return
    }

    radius = Number.parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0
    dialog.showModal()
    place(z)
    const to = target as ZoomRect
    const from = img.getBoundingClientRect()
    img.classList.add(SOURCE)
    scrollStart = window.scrollY

    if (reducedMotion()) {
      running = [image, backdrop, chrome].map(el =>
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE }),
      )
      return
    }
    const scale = from.width / to.width
    running = [
      image.animate(
        [
          {
            transform: flipTransform(from, to),
            borderRadius: `${radius / scale}px`,
          },
          { transform: 'none', borderRadius: `${radius}px` },
        ],
        { duration: DURATION, easing: EASING },
      ),
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: DURATION,
        easing: EASING,
      }),
      chrome.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: FADE,
        delay: DURATION - FADE,
        fill: 'backwards',
      }),
    ]
  }

  function close() {
    const z = zoomed
    if (!z || closing || !target || !image || !backdrop || !chrome) return
    closing = true
    // Start from wherever the opening animation got to.
    const now = getComputedStyle(image)
    const from = {
      transform: now.transform,
      borderRadius: now.borderRadius,
      opacity: now.opacity,
    }
    const backdropOpacity = getComputedStyle(backdrop).opacity
    const chromeOpacity = getComputedStyle(chrome).opacity
    stop()

    // Back to where the image is now: the page may have scrolled meanwhile.
    const to = z.img.getBoundingClientRect()
    const fadeOut = (el: HTMLElement, opacity: string, duration: number) =>
      el.animate([{ opacity }, { opacity: 0 }], {
        duration,
        easing: EASING,
        fill: 'forwards',
      })
    if (reducedMotion() || !to.width || !to.height) {
      running = [
        fadeOut(image, from.opacity, FADE),
        fadeOut(backdrop, backdropOpacity, FADE),
        fadeOut(chrome, chromeOpacity, FADE),
      ]
    } else {
      const scale = to.width / target.width
      running = [
        image.animate(
          [
            { transform: from.transform, borderRadius: from.borderRadius },
            {
              transform: flipTransform(to, target),
              borderRadius: `${radius / scale}px`,
            },
          ],
          { duration: DURATION, easing: EASING, fill: 'forwards' },
        ),
        fadeOut(backdrop, backdropOpacity, DURATION),
        fadeOut(chrome, chromeOpacity, FADE),
      ]
    }
    const closingAnimations = running
    Promise.all(closingAnimations.map(a => a.finished)).then(
      () => {
        if (running === closingAnimations) finish()
      },
      () => {},
    )
  }

  function finish() {
    stop()
    // Show the original again before closing: the dialog hands focus back
    // to it, and hidden elements can't take focus.
    zoomed?.img.classList.remove(SOURCE)
    if (dialog?.open) dialog.close()
    zoomed = null
    target = null
    closing = false
  }

  function onCancel(e: Event) {
    // Esc: play the closing animation instead of closing at once.
    e.preventDefault()
    close()
  }

  // Decided when the image is used, not from the class added on mount, so
  // images that other components move around still zoom.
  const zoomable = (el: EventTarget | null) =>
    el instanceof HTMLImageElement && el.matches(IMAGES) && !el.closest(SKIP)
      ? el
      : null

  onMount(() => {
    const marked: HTMLImageElement[] = []
    let destroyed = false
    // Wait for the first update: CodeTabs takes its panels (and the images
    // in them) out of the page on mount and puts them back in its tab frame.
    tick().then(() => {
      if (destroyed) return
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>(IMAGES),
      )
      for (const img of images) {
        if (!zoomable(img)) continue
        img.classList.add(ZOOMABLE)
        img.tabIndex = 0
        img.setAttribute('role', 'button')
        img.setAttribute('aria-haspopup', 'dialog')
        if (!img.alt) img.setAttribute('aria-label', 'Zoom image')
        marked.push(img)
      }
    })

    const onClick = (e: MouseEvent) => {
      const img = zoomable(e.target)
      if (!img) return
      e.preventDefault()
      open(img)
    }
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const img = zoomable(e.target)
      if (!img) return
      e.preventDefault()
      open(img)
    }
    const onScroll = () => {
      if (!zoomed || closing) return
      if (Math.abs(window.scrollY - scrollStart) > SCROLL_CLOSE) close()
    }
    const onResize = () => {
      if (zoomed && !closing) place(zoomed)
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeydown)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      destroyed = true
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeydown)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (zoomed) finish()
      for (const img of marked) {
        img.classList.remove(ZOOMABLE)
        img.removeAttribute('tabindex')
        img.removeAttribute('role')
        img.removeAttribute('aria-haspopup')
        if (img.getAttribute('aria-label') === 'Zoom image')
          img.removeAttribute('aria-label')
      }
    }
  })
</script>

<dialog
  bind:this={dialog}
  class="sp-zoom"
  aria-label={zoomed?.alt || 'Image'}
  oncancel={onCancel}
  onclose={() => {
    if (zoomed) finish()
  }}
>
  {#if zoomed}
    <!-- First in the dialog so it takes focus when the dialog opens. -->
    <div class="sp-zoom__chrome" bind:this={chrome}>
      <button
        type="button"
        class="sp-zoom__close"
        aria-label="Close image"
        onclick={close}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      {#if zoomed.caption}
        <p class="sp-zoom__caption" bind:this={caption}>{zoomed.caption}</p>
      {/if}
    </div>
    <button
      type="button"
      class="sp-zoom__backdrop"
      tabindex="-1"
      aria-label="Close image"
      bind:this={backdrop}
      onclick={close}
    ></button>
    <img
      class="sp-zoom__image"
      bind:this={image}
      src={zoomed.src}
      alt={zoomed.alt}
    />
  {/if}
</dialog>

<style>
  .sp-zoom {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow: hidden;
  }
  .sp-zoom::backdrop {
    background: transparent;
  }
  .sp-zoom__backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    margin: 0;
    padding: 0;
    border: 0;
    /* Opaque once faded in: text showing through competes with the caption. */
    background: var(--sp-blog-bg);
    cursor: zoom-out;
  }
  .sp-zoom__image {
    position: absolute;
    z-index: 1;
    max-width: none;
    transform-origin: 0 0;
    pointer-events: none;
    user-select: none;
  }
  .sp-zoom__chrome {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }
  .sp-zoom__caption {
    position: absolute;
    left: 1rem;
    right: 1rem;
    max-width: 42rem;
    margin: 0 auto;
    text-align: center;
    font-family: var(--sp-font-serif);
    font-variation-settings:
      'opsz' 14,
      'wght' 400,
      'SOFT' 60,
      'WONK' 1;
    font-style: italic;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--sp-blog-content);
  }
  .sp-zoom__close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid var(--sp-blog-border);
    border-radius: 999px;
    background: var(--sp-blog-surface);
    color: var(--sp-blog-text);
    cursor: pointer;
    pointer-events: auto;
    transition:
      color 0.2s,
      border-color 0.2s;
  }
  .sp-zoom__close:hover {
    color: var(--sp-blog-primary);
    border-color: var(--sp-blog-primary);
  }
  .sp-zoom__close:focus-visible {
    outline: 2px solid var(--sp-blog-primary);
    outline-offset: 2px;
  }

  :global(.sp-post-content img.sp-zoomable) {
    cursor: zoom-in;
  }
  :global(.sp-post-content img.sp-zoomable:focus-visible) {
    outline: 2px solid var(--sp-blog-primary);
    outline-offset: 3px;
  }
  /* The original stays in the layout but is hidden while its zoomed copy is
     on screen, so the image seems to lift out of the page. */
  :global(.sp-post-content img.sp-zoom-source) {
    visibility: hidden;
  }
</style>
