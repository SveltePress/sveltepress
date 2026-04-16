<!-- src/components/TableOfContents.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'

  interface Heading {
    id: string
    text: string
    level: number
  }

  let headings: Heading[] = $state([])
  let activeId = $state('')

  onMount(() => {
    const els = document.querySelectorAll<HTMLElement>(
      '.sp-post-content h2, .sp-post-content h3',
    )
    headings = Array.from(els).map(el => ({
      id: el.id,
      text: el.textContent ?? '',
      level: Number(el.tagName[1]),
    }))

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeId = entry.target.id
        }
      },
      { rootMargin: '0px 0px -60% 0px' },
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  })
</script>

{#if headings.length}
  <nav class="sp-toc">
    <p class="sp-toc__label">目录</p>
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

<style>
  .sp-toc {
    position: sticky;
    top: 80px;
    font-size: 0.8rem;
    border-left: 2px solid var(--sp-blog-border);
    padding-left: 1rem;
  }
  .sp-toc__label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sp-blog-muted);
    margin-bottom: 0.6rem;
  }
  .sp-toc ul {
    list-style: none;
    padding: 0;
  }
  .sp-toc__item {
    margin-bottom: 0.35rem;
  }
  .sp-toc__item--h3 {
    padding-left: 0.75rem;
  }
  .sp-toc__link {
    color: var(--sp-blog-muted);
    text-decoration: none;
    transition: color 0.15s;
  }
  .sp-toc__link:hover,
  .sp-toc__link--active {
    color: var(--sp-blog-primary);
  }
</style>
