<!-- Large author card for About page. Includes socials grid. -->
<script lang="ts">
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  const author = $derived(blogConfig.author)

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
        if (v) out.push({ label: d.label, href: d.href(v) })
      }
    }
    return out
  })
</script>

{#if author}
  <section class="sp-profile">
    {#if author.avatar}
      <img
        class="sp-profile__avatar"
        src={author.avatar}
        alt=""
        width="128"
        height="128"
      />
    {/if}
    <h1 class="sp-profile__name">{author.name}</h1>
    {#if author.bio}
      <p class="sp-profile__bio">{author.bio}</p>
    {/if}
    {#if socials.length}
      <ul class="sp-profile__socials">
        {#each socials as s (s.label)}
          <li><a href={s.href} rel="me">{s.label}</a></li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}

<style>
  .sp-profile {
    text-align: center;
    max-width: 640px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  .sp-profile__avatar {
    width: 128px;
    height: 128px;
    border-radius: 50%;
    border: 3px solid var(--sp-blog-primary);
    object-fit: cover;
  }
  .sp-profile__name {
    font-size: 2rem;
    font-weight: 900;
    color: var(--sp-blog-text);
    margin: 1rem 0 0.5rem;
  }
  .sp-profile__bio {
    color: var(--sp-blog-content);
    font-size: 1.05rem;
    line-height: 1.6;
  }
  .sp-profile__socials {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .sp-profile__socials a {
    display: inline-block;
    padding: 0.4rem 0.9rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 9999px;
    color: var(--sp-blog-primary);
    font-weight: 600;
    font-size: 0.875rem;
  }
  .sp-profile__socials a:hover {
    background: var(--sp-blog-border);
    text-decoration: none;
  }
</style>
