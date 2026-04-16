<!-- src/components/PostLayout.svelte -->
<script lang="ts">
  import type { BlogPost, BlogPostMeta } from '../types.js'
  import { onMount } from 'svelte'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
  import AuthorCard from './AuthorCard.svelte'
  import PostHero from './PostHero.svelte'
  import PostMeta from './PostMeta.svelte'
  import PostNav from './PostNav.svelte'
  import RelatedPosts from './RelatedPosts.svelte'
  import TableOfContents from './TableOfContents.svelte'

  interface Props {
    post: BlogPost
    prev?: BlogPostMeta | null
    next?: BlogPostMeta | null
  }

  const { post, prev, next }: Props = $props()
  const siteTitle = blogConfig.title ?? 'Blog'
  const jsonLd = $derived.by(() => {
    const authorName = post.author ?? blogConfig.author?.name
    const data: Record<string, unknown> = {}
    data['@context'] = 'https://schema.org'
    data['@type'] = 'BlogPosting'
    data.headline = post.title
    data.datePublished = post.date
    data.image = `/og/${post.slug}.png`
    data.description = post.excerpt
    data.keywords = post.tags.join(', ')
    if (authorName) {
      const a: Record<string, unknown> = {}
      a['@type'] = 'Person'
      a.name = authorName
      data.author = a
    }
    return JSON.stringify(data)
  })

  onMount(() => {
    const container = document.querySelector('.sp-post-content')
    if (!container) return

    const handler = (e: Event) => {
      const btn = (e.target as Element).closest('.svp-code-block--copy-btn')
      if (!btn) return
      const code =
        btn.closest('.svp-code-block')?.querySelector('.shiki')?.textContent ||
        ''
      navigator.clipboard.writeText(code)
      btn.classList.add('copied')
      setTimeout(() => btn.classList.remove('copied'), 2000)
    }

    container.addEventListener('click', handler)
    return () => container.removeEventListener('click', handler)
  })
</script>

<svelte:head>
  <title>{post.title} | {siteTitle}</title>
  <meta property="og:type" content="article" />
  <meta property="og:title" content={post.title} />
  <meta name="description" content={post.excerpt} />
  <meta property="og:description" content={post.excerpt} />
  <meta property="og:image" content={`/og/${post.slug}.png`} />
  <meta property="article:published_time" content={post.date} />
  {#if post.author}
    <meta property="article:author" content={post.author} />
  {/if}
  {#each post.tags as t (t)}
    <meta property="article:tag" content={t} />
  {/each}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<${'script'} type="application/ld+json">${jsonLd}</${'script'}>`}
</svelte:head>

<article class="sp-post">
  <PostHero {post} />
  <div class="sp-post__body">
    <div class="sp-post__content-wrap">
      <PostMeta {post} />
      <div class="sp-post-content">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html post.contentHtml}
      </div>
      <PostNav {prev} {next} />
      {#if post.related?.length}
        <RelatedPosts posts={post.related} />
      {/if}
      <AuthorCard />
    </div>
    <aside class="sp-post__toc">
      <TableOfContents />
    </aside>
  </div>
</article>

<style>
  .sp-post__body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .sp-post__body {
      grid-template-columns: 1fr 220px;
    }
  }
  .sp-post__content-wrap {
    min-width: 0;
  }
  .sp-post-content {
    line-height: 1.75;
    color: var(--sp-blog-content);
  }
  .sp-post-content :global(h2),
  .sp-post-content :global(h3) {
    color: var(--sp-blog-text);
    font-weight: 700;
    margin: 2rem 0 0.75rem;
  }
  .sp-post-content :global(h2) {
    font-size: 1.35rem;
  }
  .sp-post-content :global(h3) {
    font-size: 1.1rem;
  }
  .sp-post-content :global(p) {
    margin-bottom: 1.15rem;
  }
  /* Inline code only — Shiki <pre> blocks are styled in GlobalLayout */
  .sp-post-content :global(code:not(pre code)) {
    background: var(--sp-blog-surface);
    color: var(--sp-blog-primary);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.875em;
  }
  .sp-post-content :global(blockquote) {
    border-left: 3px solid var(--sp-blog-primary);
    padding-left: 1rem;
    color: var(--sp-blog-muted);
    margin: 1.25rem 0;
  }
  .sp-post-content :global(a) {
    color: var(--sp-blog-primary);
  }
  .sp-post__toc {
    display: none;
  }
  @media (min-width: 1024px) {
    .sp-post__toc {
      display: block;
    }
  }
</style>
