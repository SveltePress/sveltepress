<!-- Left-rail sidebar: author identity + nav + search + theme toggle.
     On mobile (<1024px) renders as a stacked top banner. -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { base } from '$app/paths'
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  interface NavLink {
    title: string
    to: string
  }

  interface Props {
    title: string
    links?: NavLink[]
    search?: Snippet
    toggle?: Snippet
  }

  const { title, links = [], search, toggle }: Props = $props()
  const author = $derived(blogConfig.author)
  const about = $derived(blogConfig.about)

  // User-configured nav links and asset paths use site-relative paths like
  // "/avatar.png" or "/timeline/"; prepend SvelteKit's `base` so they resolve
  // under a subpath deploy. Leaves protocol-qualified URLs alone.
  function href(to: string) {
    if (/^(?:[a-z]+:)?\/\//i.test(to)) return to
    return to.startsWith('/') ? `${base}${to}` : to
  }

  const socialDefs = [
    {
      key: 'github',
      label: 'GitHub',
      href: (v: string) => `https://github.com/${v}`,
    },
    {
      key: 'twitter',
      label: 'Twitter/X',
      href: (v: string) => `https://x.com/${v}`,
    },
    { key: 'mastodon', label: 'Mastodon', href: (v: string) => v },
    {
      key: 'bluesky',
      label: 'Bluesky',
      href: (v: string) => `https://bsky.app/profile/${v}`,
    },
    { key: 'email', label: 'Email', href: (v: string) => `mailto:${v}` },
    { key: 'website', label: 'Website', href: (v: string) => v },
    { key: 'rss', label: 'RSS', href: (v: string) => v },
  ] as const

  const socials = $derived.by(() => {
    const s = author?.socials
    const out = []
    if (s) {
      for (const d of socialDefs) {
        const v = s[d.key]
        if (v) out.push({ label: d.label, href: href(d.href(v)) })
      }
    }
    return out
  })

  function openSearch() {
    dispatchEvent(new CustomEvent('sp-search-open'))
  }
</script>

<aside class="sp-sidebar">
  <a href="{base}/" class="sp-sidebar__brand">{title}</a>

  {#if author}
    <section class="sp-sidebar__profile">
      {#if author.avatar}
        <img
          class="sp-sidebar__avatar"
          src={href(author.avatar)}
          alt=""
          width="80"
          height="80"
        />
      {/if}
      <div class="sp-sidebar__name">{author.name}</div>
      {#if author.bio}
        <p class="sp-sidebar__bio">{author.bio}</p>
      {/if}
      {#if socials.length}
        <ul class="sp-sidebar__socials">
          {#each socials as s (s.label)}
            <li><a href={s.href} rel="me">{s.label}</a></li>
          {/each}
        </ul>
      {/if}
      {#if about?.html}
        <div class="sp-sidebar__about">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html about.html}
        </div>
      {/if}
    </section>
  {/if}

  {#if links.length}
    <nav class="sp-sidebar__nav" aria-label="Primary">
      {#each links as link (link.to)}
        <a href={href(link.to)}>{link.title}</a>
      {/each}
    </nav>
  {/if}

  <div class="sp-sidebar__actions">
    {#if search}
      {@render search()}
    {:else}
      <button
        type="button"
        class="sp-sidebar__search"
        onclick={openSearch}
        aria-label="Search"
        title="Search (⌘K / Ctrl+K)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span class="sp-sidebar__search-label">Search</span>
        <kbd class="sp-sidebar__search-kbd">⌘K</kbd>
      </button>
    {/if}
    {@render toggle?.()}
  </div>
</aside>

<style>
  .sp-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem 1.25rem;
    background: var(--sp-blog-surface);
    border-right: 1px solid var(--sp-blog-border);
    min-height: 100vh;
  }
  .sp-sidebar__brand {
    font-family: var(--sp-font-serif);
    font-variation-settings:
      'opsz' 144,
      'wght' 700,
      'SOFT' 80,
      'WONK' 1;
    font-style: italic;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--sp-blog-primary);
    letter-spacing: -0.01em;
    text-decoration: none;
  }
  .sp-sidebar__profile {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .sp-sidebar__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--sp-blog-primary);
  }
  .sp-sidebar__name {
    font-weight: 800;
    font-size: 1.05rem;
    color: var(--sp-blog-text);
  }
  .sp-sidebar__bio {
    color: var(--sp-blog-content);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }
  .sp-sidebar__socials {
    list-style: none;
    padding: 0;
    margin: 0.25rem 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .sp-sidebar__socials a {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 9999px;
    color: var(--sp-blog-primary);
    font-size: 0.75rem;
    font-weight: 600;
    text-decoration: none;
  }
  .sp-sidebar__socials a:hover {
    background: var(--sp-blog-border);
  }
  .sp-sidebar__about {
    color: var(--sp-blog-content);
    font-size: 0.85rem;
    line-height: 1.55;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--sp-blog-border);
  }
  .sp-sidebar__about :global(p) {
    margin: 0 0 0.5rem;
  }
  .sp-sidebar__about :global(a) {
    color: var(--sp-blog-primary);
  }
  .sp-sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sp-blog-border);
  }
  .sp-sidebar__nav a {
    color: var(--sp-blog-content);
    text-decoration: none;
    font-size: 0.9rem;
    padding: 0.3rem 0;
    transition: color 0.15s;
  }
  .sp-sidebar__nav a:hover {
    color: var(--sp-blog-primary);
  }
  .sp-sidebar__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sp-blog-border);
  }
  .sp-sidebar__search {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    height: 32px;
    padding: 0 0.6rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 6px;
    background: transparent;
    color: var(--sp-blog-muted);
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
    transition:
      border-color 0.15s,
      color 0.15s;
  }
  .sp-sidebar__search:hover {
    border-color: var(--sp-blog-primary);
    color: var(--sp-blog-primary);
  }
  .sp-sidebar__search-kbd {
    font-family: inherit;
    font-size: 0.72rem;
    padding: 1px 4px;
    border-radius: 3px;
    background: var(--sp-blog-bg);
    color: var(--sp-blog-muted);
    margin-left: auto;
  }

  /* On narrow viewports the sidebar stacks above main content and hides
     the verbose bits (bio + socials + about). */
  @media (max-width: 1023px) {
    .sp-sidebar {
      min-height: auto;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-right: none;
      border-bottom: 1px solid var(--sp-blog-border);
    }
    .sp-sidebar__brand {
      margin-right: auto;
    }
    .sp-sidebar__profile {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      order: -1;
    }
    .sp-sidebar__avatar {
      width: 32px;
      height: 32px;
      border-width: 1px;
    }
    .sp-sidebar__name {
      font-size: 0.9rem;
    }
    .sp-sidebar__bio,
    .sp-sidebar__socials,
    .sp-sidebar__about {
      display: none;
    }
    .sp-sidebar__nav {
      flex-direction: row;
      gap: 1rem;
      padding-top: 0;
      border-top: none;
    }
    .sp-sidebar__actions {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
    .sp-sidebar__search {
      flex: 0 0 auto;
    }
    .sp-sidebar__search-label {
      display: none;
    }
  }
</style>
