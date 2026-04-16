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
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    margin-top: 2rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 10px;
    background: var(--sp-blog-surface);
  }
  .sp-author__avatar {
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--sp-blog-primary);
  }
  .sp-author__name {
    font-weight: 700;
    color: var(--sp-blog-text);
    margin: 0;
  }
  .sp-author__bio {
    font-size: 0.875rem;
    color: var(--sp-blog-muted);
    margin: 0.15rem 0 0;
  }
</style>
