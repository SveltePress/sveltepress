<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
  import siteConfig from 'virtual:sveltepress/site'
  import NavItem from './NavItem.svelte'
  import { base } from '$app/paths'
</script>

<NavItem to={base === '' ? '/' : base} title={siteConfig.title}>
  {#if themeOptions.logo}
    <img
      class="logo"
      height="32"
      src={themeOptions.logo}
      alt={siteConfig.title}
    />
    <span class="title">
      {siteConfig.title}
    </span>
  {/if}
</NavItem>

<style>
  .logo {
    --at-apply: h-[32px];
  }
  .title {
    --at-apply: font-600 ml-2;
  }
</style>
