<script lang="ts">
  import AuthorProfile from '@sveltepress/theme-blog/components/AuthorProfile.svelte'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
</script>

<svelte:head>
  <title>About | {blogConfig.title ?? 'Blog'}</title>
</svelte:head>

<AuthorProfile />

{#if blogConfig.about?.html}
  <div class="sp-about-content">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html blogConfig.about.html}
  </div>
{/if}

<style>
  .sp-about-content {
    max-width: 640px;
    margin: 2rem auto;
    padding: 0 1rem;
    line-height: 1.7;
    color: var(--sp-blog-content);
  }
  .sp-about-content :global(a) {
    color: var(--sp-blog-primary);
  }
</style>
