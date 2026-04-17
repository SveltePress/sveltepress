<!-- Compact author row for post footer. Pulls from blogConfig.author; renders nothing if unset. -->
<script lang="ts">
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  const author = $derived(blogConfig.author)
</script>

{#if author}
  <section class="sp-author" aria-label="About the author">
    {#if author.avatar}
      <img
        class="sp-author__avatar"
        src={author.avatar}
        alt=""
        width="56"
        height="56"
        loading="lazy"
      />
    {/if}
    <div class="sp-author__body">
      <p class="sp-author__name">{author.name}</p>
      {#if author.bio}
        <p class="sp-author__bio">{author.bio}</p>
      {/if}
    </div>
  </section>
{/if}

<style>
  .sp-author {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    margin-top: 2.25rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 8px;
    background: var(--sp-blog-surface);
  }
  .sp-author__avatar {
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
  }
  .sp-author__name {
    font-family: var(--sp-font-serif);
    font-variation-settings:
      'opsz' 48,
      'wght' 600,
      'SOFT' 70,
      'WONK' 1;
    font-size: 1.125rem;
    color: var(--sp-blog-text);
    margin: 0 0 0.25rem;
  }
  .sp-author__bio {
    font-family: var(--sp-font-sans);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--sp-blog-muted);
    margin: 0;
  }
</style>
