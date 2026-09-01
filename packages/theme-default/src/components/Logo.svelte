<script>
  import { page } from '$app/state'
  import siteConfig from 'virtual:sveltepress/site'
  import { resolveLocaleOptions } from './locale'
  import NavItem from './NavItem.svelte'
  import { parseImageSrc } from './utils'

  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
</script>

<NavItem to="/" title={siteConfig.title} brand>
  {#if localeOptions.logo}
    <img
      class="logo"
      height="32"
      src={parseImageSrc(localeOptions.logo)}
      alt={siteConfig.title}
    />
    <span class="title">
      {siteConfig.title}
    </span>
  {/if}
</NavItem>

<style>
  .logo {
    --at-apply: 'h-[32px]';
  }
  .title {
    --at-apply: 'font-600 ml-2';
  }
</style>
