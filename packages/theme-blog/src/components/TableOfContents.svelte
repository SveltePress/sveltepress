<!-- src/components/TableOfContents.svelte -->
<script lang="ts">
  import { onMount, tick } from 'svelte'
  import SideRail from './SideRail.svelte'

  interface Props {
    category?: string
  }

  const { category }: Props = $props()

  interface Heading {
    id: string
    text: string
    level: number
  }

  let headings: Heading[] = $state([])
  let activeId = $state('')

  onMount(() => {
    let els: HTMLElement[] = []
    let raf = 0

    const collect = () => {
      els = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.sp-post-content h2, .sp-post-content h3',
        ),
      ).filter(el => el.id)
      headings = els.map(el => ({
        id: el.id,
        text: el.textContent ?? '',
        level: Number(el.tagName[1]),
      }))
    }

    // Active = last heading whose top has crossed the trigger line
    // (20% from viewport top). Matches how Nuxt / VitePress handle it.
    const compute = () => {
      if (!els.length) return
      const trigger = window.innerHeight * 0.2
      let current = els[0].id
      for (const el of els) {
        if (el.getBoundingClientRect().top - trigger < 1) current = el.id
        else break
      }
      // If we're above the first heading, no section is active yet.
      if (els[0].getBoundingClientRect().top > trigger) current = ''
      activeId = current
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    collect()
    compute()

    // Re-collect once DOM settles (headings may render after mount via {@html}).
    tick().then(() => {
      collect()
      compute()
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  })
</script>

<div class="sp-toc-wrap">
  <SideRail {category} />
  {#if headings.length}
    <nav class="sp-toc">
      <p class="sp-toc__label">On this page</p>
      <ul>
        {#each headings as h}
          <li class="sp-toc__item" class:sp-toc__item--h3={h.level === 3}>
            <a
              href={`#${h.id}`}
              class="sp-toc__link"
              class:sp-toc__link--active={activeId === h.id}>{h.text}</a
            >
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>

<style>
  .sp-toc-wrap {
    position: sticky;
    top: 80px;
    min-height: 220px;
  }
  .sp-toc {
    font-family: var(--sp-font-sans);
    font-size: 0.8rem;
    padding-right: 1rem; /* reserve room for the vertical rail */
  }
  .sp-toc__label {
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: var(--sp-blog-muted);
    margin-bottom: 0.75rem;
    padding-left: 0.85rem;
  }
  .sp-toc ul {
    list-style: none;
    padding: 0;
    margin: 0;
    border-left: 2px solid var(--sp-blog-border);
  }
  .sp-toc__item {
    position: relative;
    margin: 0;
  }
  .sp-toc__link {
    display: block;
    padding: 0.3rem 0.85rem;
    margin-left: -2px;
    border-left: 2px solid transparent;
    color: var(--sp-blog-muted);
    text-decoration: none;
    line-height: 1.4;
    letter-spacing: 0;
    text-transform: none;
    font-weight: 400;
    transition:
      color 0.15s,
      border-color 0.15s;
  }
  .sp-toc__item--h3 .sp-toc__link {
    padding-left: 1.6rem;
  }
  .sp-toc__link:hover {
    color: var(--sp-blog-text);
  }
  .sp-toc__link--active {
    color: var(--sp-blog-primary);
    border-left-color: var(--sp-blog-primary);
    font-weight: 500;
  }
</style>
