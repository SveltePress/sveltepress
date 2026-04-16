<!-- src/components/Timeline.svelte -->
<script lang="ts">
  import type { BlogPostMeta } from '../types.js'
  import { onMount } from 'svelte'

  interface Props {
    posts: BlogPostMeta[]
  }

  const { posts }: Props = $props()

  interface YearGroup {
    year: string
    posts: BlogPostMeta[]
  }

  // Posts are already sorted desc by date. Group by year, preserving order.
  const groups = $derived.by<YearGroup[]>(() => {
    const map = new Map<string, BlogPostMeta[]>()
    for (const p of posts) {
      const y = p.date.slice(0, 4)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(p)
    }
    return Array.from(map, ([year, posts]) => ({ year, posts }))
  })

  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  function fmtDate(iso: string) {
    const [, m, d] = iso.split('-')
    return `${MONTHS[Number(m) - 1]} ${Number(d)}`
  }

  const totalPosts = $derived(posts.length)
  const yearSpan = $derived(
    groups.length > 1
      ? `${groups[groups.length - 1].year}–${groups[0].year}`
      : (groups[0]?.year ?? ''),
  )

  let container: HTMLElement | undefined = $state()

  onMount(() => {
    if (!container) return
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    container.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    return () => io.disconnect()
  })
</script>

<div class="sp-tl" bind:this={container}>
  <header class="sp-tl__hero">
    <span class="sp-tl__eyebrow">Archive</span>
    <h1 class="sp-tl__title">
      Timeline
      <span class="sp-tl__title-accent">.</span>
    </h1>
    <p class="sp-tl__subtitle">
      <strong>{totalPosts}</strong>
      {totalPosts === 1 ? 'post' : 'posts'}
      <span class="sp-tl__sep">·</span>
      <strong>{yearSpan}</strong>
    </p>
  </header>

  {#each groups as group, gi (group.year)}
    <section class="sp-tl__year-group" style="--gi: {gi}">
      <div class="sp-tl__year-col">
        <div class="sp-tl__year" data-reveal>
          <span class="sp-tl__year-num">{group.year}</span>
          <span class="sp-tl__year-count">
            {group.posts.length}
            {group.posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>

      <ol class="sp-tl__list">
        {#each group.posts as post, i (post.slug)}
          <li class="sp-tl__item" data-reveal style="--i: {i}">
            <span class="sp-tl__dot" aria-hidden="true"></span>
            <a href={`/posts/${post.slug}/`} class="sp-tl__card">
              <div class="sp-tl__meta">
                <time class="sp-tl__date">{fmtDate(post.date)}</time>
                {#if post.category}
                  <span class="sp-tl__cat">{post.category}</span>
                {/if}
                <span class="sp-tl__reading">
                  {post.readingTime} min
                </span>
              </div>
              <h2 class="sp-tl__post-title">{post.title}</h2>
              <p class="sp-tl__excerpt">{post.excerpt}</p>
              {#if post.tags.length}
                <div class="sp-tl__tags">
                  {#each post.tags as tag}
                    <span class="sp-tl__tag">#{tag}</span>
                  {/each}
                </div>
              {/if}
            </a>
          </li>
        {/each}
      </ol>
    </section>
  {/each}
</div>

<style>
  .sp-tl {
    padding: 2rem 0 4rem;
    max-width: 900px;
    margin: 0 auto;
  }

  /* ── Hero ────────────────────────────────────────── */
  .sp-tl__hero {
    padding: 1rem 0 3.5rem;
    border-bottom: 1px solid var(--sp-blog-border);
    margin-bottom: 3rem;
  }
  .sp-tl__eyebrow {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--sp-blog-primary);
    margin-bottom: 0.6rem;
  }
  .sp-tl__title {
    font-size: clamp(2.4rem, 6vw, 4rem);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--sp-blog-text);
    margin: 0;
  }
  .sp-tl__title-accent {
    color: var(--sp-blog-primary);
  }
  .sp-tl__subtitle {
    margin-top: 0.75rem;
    font-size: 0.95rem;
    color: var(--sp-blog-muted);
  }
  .sp-tl__subtitle strong {
    color: var(--sp-blog-text);
    font-weight: 700;
  }
  .sp-tl__sep {
    margin: 0 0.5rem;
    opacity: 0.5;
  }

  /* ── Year group layout ──────────────────────────── */
  .sp-tl__year-group {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    position: relative;
  }

  /* Vertical timeline rail (right edge of year col) */
  .sp-tl__year-group::before {
    content: '';
    position: absolute;
    left: 120px;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--sp-blog-primary) 0%,
      var(--sp-blog-border) 8%,
      var(--sp-blog-border) 92%,
      transparent 100%
    );
    opacity: 0.55;
  }

  /* ── Year column ────────────────────────────────── */
  .sp-tl__year-col {
    position: relative;
  }
  .sp-tl__year {
    position: sticky;
    top: 80px;
    text-align: right;
    padding-right: 1.5rem;
    opacity: 0;
    transform: translateY(12px);
    transition:
      opacity 0.6s,
      transform 0.6s;
  }
  .sp-tl__year:global(.is-visible) {
    opacity: 1;
    transform: none;
  }
  .sp-tl__year-num {
    display: block;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--sp-blog-text);
    font-variant-numeric: tabular-nums;
  }
  .sp-tl__year-count {
    display: block;
    margin-top: 0.4rem;
    font-size: 0.72rem;
    color: var(--sp-blog-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── Post list ──────────────────────────────────── */
  .sp-tl__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .sp-tl__item {
    position: relative;
    padding-left: 1.75rem;
    opacity: 0;
    transform: translateX(-12px);
    transition:
      opacity 0.5s ease-out,
      transform 0.5s ease-out;
    transition-delay: calc(var(--i, 0) * 60ms);
    content-visibility: auto;
    contain-intrinsic-size: auto 180px;
  }
  .sp-tl__item:global(.is-visible) {
    opacity: 1;
    transform: none;
  }

  /* Dot on the rail */
  .sp-tl__dot {
    position: absolute;
    left: -6px;
    top: 1.1rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--sp-blog-bg);
    border: 2px solid var(--sp-blog-primary);
    box-shadow: 0 0 0 3px var(--sp-blog-bg);
    transition:
      transform 0.2s,
      background 0.2s;
  }
  .sp-tl__item:hover .sp-tl__dot {
    transform: scale(1.35);
    background: var(--sp-blog-primary);
  }

  /* Connector from dot to card */
  .sp-tl__item::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 1.4rem;
    width: 1.25rem;
    height: 1px;
    background: var(--sp-blog-border);
  }

  /* ── Card ───────────────────────────────────────── */
  .sp-tl__card {
    display: block;
    padding: 1rem 1.25rem;
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
    transition:
      border-color 0.2s,
      transform 0.2s,
      box-shadow 0.2s;
  }
  .sp-tl__card:hover {
    border-color: var(--sp-blog-primary);
    transform: translateX(3px);
    box-shadow: -3px 3px 0 0
      color-mix(in oklab, var(--sp-blog-primary) 15%, transparent);
  }

  .sp-tl__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.72rem;
    color: var(--sp-blog-muted);
    margin-bottom: 0.4rem;
  }
  .sp-tl__date {
    font-weight: 700;
    color: var(--sp-blog-primary);
    font-variant-numeric: tabular-nums;
  }
  .sp-tl__cat {
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--sp-blog-bg);
    border: 1px solid var(--sp-blog-border);
    color: var(--sp-blog-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }
  .sp-tl__reading {
    opacity: 0.7;
  }

  .sp-tl__post-title {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.35;
    color: var(--sp-blog-text);
    margin: 0 0 0.35rem;
    letter-spacing: -0.01em;
    transition: color 0.2s;
  }
  .sp-tl__card:hover .sp-tl__post-title {
    color: var(--sp-blog-primary);
  }

  .sp-tl__excerpt {
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--sp-blog-content);
    margin: 0 0 0.6rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .sp-tl__tags {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .sp-tl__tag {
    font-size: 0.7rem;
    color: var(--sp-blog-muted);
    font-weight: 500;
  }

  /* ── Responsive ─────────────────────────────────── */
  @media (max-width: 640px) {
    .sp-tl__year-group {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    .sp-tl__year-group::before {
      left: 6px;
    }
    .sp-tl__year {
      position: static;
      text-align: left;
      padding: 0 0 0.75rem 1.5rem;
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }
    .sp-tl__year-num {
      font-size: 1.5rem;
    }
    .sp-tl__year-count {
      margin-top: 0;
    }
  }
</style>
