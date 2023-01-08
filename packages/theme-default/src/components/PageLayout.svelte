<script >
  import { getSidebars } from '@svelte-press/vite/client'
  import { page } from '$app/stores'
  import ActionButton from './ActionButton.svelte';

  const routeId = $page.route.id

  const sidebars = getSidebars(routeId)

  // The frontmatter info. This would be injected by sveltepress
  export let fm = {}

  export let siteConfig

  const { 
    sidebar = 'auto', 
    features = [],
    actions = [],
    heroImage,
    tagline,
    title,
  } = fm


  $: isHome = $page.route.id === '/'
</script>
  
{#if !isHome}
  <div text-md flex>
    {#if sidebar === 'auto'}
      <aside>
        {#each sidebars as sidebarItem}
          <div>
            {sidebarItem}
          </div>
        {/each}
      </aside>
    {/if}
    <div flex-grow>
      <div md:w-200 mx-auto lg:w-230 xl:w-260>
        {#if title}
          <h1>
            {title}
          </h1>
        {/if}
        <slot />
      </div>
    </div>
  </div>
{:else}
  <div class="home-page">
    <div class="title">
      <div class="intro">
        <div class="gradient-title">
          {siteConfig.title}
        </div>
        <div>
          {siteConfig.description}
        </div>
        {#if tagline}
          <div class="tagline">
            {tagline}
          </div>
        {/if}
      </div>
      {#if heroImage}
        <div class="hero-image">
          <img src={heroImage} alt={siteConfig.title} w-80 />
        </div>
      {/if}
    </div>

    <div class="actions">
      {#each actions as action}
        <ActionButton {...action} />
      {/each}
    </div>

    <div class="features">
      {#each features as fe}
        <div>
          <div>
            Icon
            <!-- TODO: add icons -->
          </div>
          <div>
            {fe.title}
          </div>
          <div>
            {fe.description}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .home-page {
    --at-apply: max-w-[1152px] mx-auto pt-20;
  }
  .title {
    --at-apply: text-16 grid grid-cols-12 font-700 leading-18;
  }
  .intro {
    grid-column-start: 1;
    grid-column-end: span 7;
  }
  .hero-image {
    --at-apply: flex items-center justify-center col-start;
    grid-column-start: 8;
    grid-column-end: span 5;
  }
  .gradient-title {
    background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .tagline {
    --at-apply: text-slate-5 text-6 mt-4 font-500 leading-9;
  }
  .actions {
    --at-apply: flex gap-4 mt-4;
  }
</style>