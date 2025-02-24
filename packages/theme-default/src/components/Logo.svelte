<script>
  import siteConfig from 'virtual:sveltepress/site'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import NavItem from './NavItem.svelte'
  import { getPathFromBase, parseImageSrc } from './utils'
</script>

<NavItem to={getPathFromBase('/')} title={siteConfig.title}>
  {#if themeOptions.logo}
    <img
      class="logo"
      height="32"
      src={parseImageSrc(themeOptions.logo)}
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
