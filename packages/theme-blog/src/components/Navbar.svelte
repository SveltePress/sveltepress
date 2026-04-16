<!-- src/components/Navbar.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

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

  function openSearch() {
    dispatchEvent(new CustomEvent('sp-search-open'))
  }
</script>

<nav class="sp-blog-nav">
  <a href="/" class="sp-blog-nav__logo">{title}</a>
  <div class="sp-blog-nav__links">
    {#each links as link}
      <a href={link.to}>{link.title}</a>
    {/each}
    {#if search}
      {@render search()}
    {:else}
      <button
        type="button"
        class="sp-nav-search"
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
        <span class="sp-nav-search__label">Search</span>
        <kbd class="sp-nav-search__kbd">⌘K</kbd>
      </button>
    {/if}
    {@render toggle?.()}
  </div>
</nav>

<style>
  .sp-blog-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--sp-blog-surface);
    border-bottom: 1px solid var(--sp-blog-border);
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    height: 56px;
    gap: 1rem;
  }
  .sp-blog-nav__logo {
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--sp-blog-primary);
    letter-spacing: -0.02em;
    text-decoration: none;
  }
  .sp-blog-nav__links {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-left: auto;
    font-size: 0.875rem;
  }
  .sp-blog-nav__links a {
    color: var(--sp-blog-content);
    text-decoration: none;
    transition: color 0.15s;
  }
  .sp-blog-nav__links a:hover {
    color: var(--sp-blog-primary);
  }
  .sp-nav-search {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
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
  .sp-nav-search:hover {
    border-color: var(--sp-blog-primary);
    color: var(--sp-blog-primary);
  }
  .sp-nav-search__kbd {
    font-family: inherit;
    font-size: 0.72rem;
    padding: 1px 4px;
    border-radius: 3px;
    background: var(--sp-blog-bg);
    color: var(--sp-blog-muted);
  }
  @media (max-width: 640px) {
    .sp-nav-search__label,
    .sp-nav-search__kbd {
      display: none;
    }
  }
</style>
