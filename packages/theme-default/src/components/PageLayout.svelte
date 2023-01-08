<script >
  import { getSidebars } from '@svelte-press/vite/client'
  import { page } from '$app/stores'
  import ActionButton from './ActionButton.svelte'
  import Apple from './icons/Apple.svelte'
  import Banana from './icons/Banana.svelte'
  import Grapes from './icons/Grapes.svelte'
  import Peach from './icons/Peach.svelte'
  import Tomato from './icons/Tomato.svelte'
  import Watermelon from './icons/Watermelon.svelte'

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

  const icons = [Apple, Banana, Grapes, Peach, Tomato, Watermelon]

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
      {#each features as fe, i}
        <div class="feature-item">
          <div flex justify-between items-start>
            <div font-600 mb-2 pt-4>
              {fe.title}
            </div>
            <div text-10>
              <svelte:component this={icons[ i % icons.length]} />
            </div>
          </div>
          <div text-slate-5>
            {fe.description}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <slot />
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
  .features {
    --at-apply: grid grid-cols-3 gap-4 mt-6;
  }
  .feature-item {
    --at-apply: bg-white dark:bg-slate-9 px-4 pb-4 rounded-lg hover:shadow-md
      transition-shadow;
  }
</style>