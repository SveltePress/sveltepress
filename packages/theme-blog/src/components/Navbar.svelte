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
</script>

<nav class="sp-blog-nav">
  <a href="/" class="sp-blog-nav__logo">{title}</a>
  <div class="sp-blog-nav__links">
    {#each links as link}
      <a href={link.to}>{link.title}</a>
    {/each}
    {@render search?.()}
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
</style>
