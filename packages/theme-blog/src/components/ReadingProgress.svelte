<!-- Thin progress bar fixed to top of viewport that fills as the user
     scrolls through the target element (default: `article`). -->
<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    target?: string
  }

  const { target = 'article' }: Props = $props()
  let progress = $state(0)

  onMount(() => {
    const el = document.querySelector<HTMLElement>(target)
    if (!el) return

    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = -rect.top
      progress = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0
    }
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  })
</script>

<div
  class="sp-reading-progress"
  role="progressbar"
  aria-label="Reading progress"
  aria-valuenow={Math.round(progress * 100)}
  aria-valuemin="0"
  aria-valuemax="100"
  style="--progress: {progress}"
></div>

<style>
  .sp-reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 100;
    pointer-events: none;
    background: transparent;
  }
  .sp-reading-progress::after {
    content: '';
    display: block;
    height: 100%;
    width: calc(var(--progress) * 100%);
    background: var(--sp-blog-primary);
    transition: width 0.1s linear;
    will-change: width;
  }
</style>
