<script>
  import { page } from '$app/state'
  import ActionButton from './ActionButton.svelte'
  import Feature from './home/Feature.svelte'
  import InstallCommand from './home/InstallCommand.svelte'
  import { resolveLocaleLink } from './locale'
  import { getPathFromBase } from './utils'

  const {
    features = [],
    actions = [],
    tagline = '',
    siteConfig,
    title = siteConfig.title,
    description = siteConfig.description,
    badge = undefined,
    installCommand = undefined,
    heroImage,
    children,
  } = $props()

  const resolvedBadgeLink = $derived.by(() => {
    if (!badge || typeof badge !== 'object' || !badge.link) return ''
    if (/^https?:\/\//.test(badge.link)) return badge.link
    return getPathFromBase(resolveLocaleLink(badge.link, page.url.pathname))
  })
</script>

<div class="home-page">
  <div class="title">
    <div class="intro">
      {#if badge}
        <div class="badge-wrapper">
          {#if resolvedBadgeLink}
            <a href={resolvedBadgeLink} class="home-badge">
              <span class="badge-dot"></span>
              <span class="badge-text">{badge.text}</span>
              <span class="badge-arrow" aria-hidden="true">→</span>
            </a>
          {:else}
            <div class="home-badge">
              <span class="badge-dot"></span>
              <span class="badge-text"
                >{typeof badge === 'string' ? badge : badge.text}</span
              >
            </div>
          {/if}
        </div>
      {/if}
      <h1 class="gradient-title">
        {title}
      </h1>
      <div class="description">
        {description}
      </div>
      {#if tagline}
        <div class="tagline">
          {tagline}
        </div>
      {/if}
    </div>
    {#if heroImage}
      {@render heroImage()}
    {/if}
  </div>

  {#if actions.length || installCommand}
    <div class="hero-cta-group">
      {#if actions.length}
        <div class="actions">
          {#each actions as action}
            <ActionButton {...action} />
          {/each}
        </div>
      {/if}
      {#if installCommand}
        <div class="install-wrapper">
          <InstallCommand
            command={typeof installCommand === 'string'
              ? installCommand
              : installCommand.command}
            packageManager={typeof installCommand === 'object'
              ? installCommand.packageManager
              : undefined}
          />
        </div>
      {/if}
    </div>
  {/if}

  {#if features.length}
    {@const hasSpotlight = features.some(f => f.spotlight)}
    {#if hasSpotlight}
      {@const spotlights = features.filter(f => f.spotlight)}
      {@const regulars = features.filter(f => !f.spotlight)}
      <div class="features spotlight-features">
        {#each spotlights as fe, i}
          <Feature {...fe} {i} />
        {/each}
      </div>
      {#if regulars.length}
        <div class="features regular-features">
          {#each regulars as fe, i}
            <Feature {...fe} i={spotlights.length + i} />
          {/each}
        </div>
      {/if}
    {:else}
      <div class="features">
        {#each features as fe, i}
          <Feature {...fe} {i} />
        {/each}
      </div>
    {/if}
  {/if}
</div>

{#if children}
  <div class="home-content">
    {@render children()}
  </div>
{/if}

<style>
  .home-page {
    --at-apply: 'sm:w-[70vw] max-w-[1152px] mx-auto sm:px-0 px-4 pt-6 sm:pt-14';
    position: relative;
  }
  .home-page::before {
    content: ' ';
    position: absolute;
    top: -80px;
    left: -15%;
    right: -15%;
    height: 620px;
    background:
      radial-gradient(
        55% 55% at 30% 10%,
        rgb(225 29 72 / 14%),
        transparent 70%
      ),
      radial-gradient(
        45% 45% at 70% 12%,
        rgb(217 119 6 / 11%),
        transparent 65%
      ),
      radial-gradient(30% 30% at 50% 35%, rgb(244 63 94 / 8%), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
  .home-page > * {
    position: relative;
    z-index: 1;
  }
  :global(.dark) .home-page::before {
    background:
      radial-gradient(
        55% 55% at 30% 10%,
        rgb(251 113 133 / 18%),
        transparent 70%
      ),
      radial-gradient(
        45% 45% at 70% 12%,
        rgb(251 191 36 / 13%),
        transparent 65%
      ),
      radial-gradient(35% 35% at 50% 35%, rgb(244 63 94 / 10%), transparent 60%);
  }
  .title {
    --at-apply: 'sm:text-16 text-10 grid grid-cols-12 font-700 leading-[1.15] tracking-[-0.02em]';
  }
  .description {
    --at-apply: 'text-8 leading-[1.2] sm:text-inherit text-zinc-9 dark:text-zinc-1';
  }
  .intro {
    --at-apply: 'col-start-1 sm:col-span-7 col-span-12 row-start-2 sm:row-start-1 text-center sm:text-left';
  }
  .badge-wrapper {
    --at-apply: 'flex justify-center sm:justify-start mb-4';
  }
  .home-badge {
    --at-apply: 'inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-12px sm:text-13px font-500 bg-black/4 dark:bg-white/8 text-zinc-7 dark:text-zinc-3 b-1 b-solid b-black/8 dark:b-white/12 backdrop-blur-sm transition-all duration-200 no-underline hover:b-svp-primary/40 hover:text-svp-primary-deep dark:hover:text-svp-primary select-none';
  }
  .badge-dot {
    --at-apply: 'w-1.5 h-1.5 rounded-full bg-svp-primary-deep dark:bg-svp-primary';
  }
  .badge-arrow {
    --at-apply: 'text-12px opacity-60 transition-transform duration-200';
  }
  .home-badge:hover .badge-arrow {
    transform: translateX(2px);
    --at-apply: 'opacity-100';
  }
  .gradient-title {
    --at-apply: 'svp-gradient-text pb-1 m-0 text-[1em] leading-[inherit] font-700';
  }
  .tagline {
    --at-apply: 'text-zinc-5 dark:text-zinc-4 text-6 mt-5 font-400 leading-9';
  }
  .hero-cta-group {
    --at-apply: 'mt-8 flex flex-col gap-4 items-center sm:items-start';
  }
  .actions {
    --at-apply: 'grid-cols-1 px-10 sm:px-0 grid sm:flex gap-4 justify-center sm:justify-start max-w-[320px] mx-auto sm:max-w-none sm:mx-0';
  }
  .install-wrapper {
    --at-apply: 'px-6 sm:px-0 flex justify-center sm:justify-start';
  }
  /* flex + centered wrap so an orphan last row (e.g. 5 cards in 3 columns)
     centers instead of leaving a hole at the bottom-right */
  .features {
    --at-apply: 'flex flex-wrap justify-center gap-6 mt-10 sm:mt-16 mb-8';
  }
  .spotlight-features {
    --at-apply: 'mt-12 sm:mt-18 mb-6';
  }
  .regular-features {
    --at-apply: 'mt-6 mb-10';
  }
  .features > :global(.feature-item) {
    --at-apply: 'basis-full sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] grow-0 shrink-0 box-border';
  }
  .home-content {
    --at-apply: 'sm:w-[70vw] max-w-[1152px] mx-auto px-4 sm:px-0 pb-12 sm:pb-24';
  }
</style>
