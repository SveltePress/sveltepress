<script>
  import siteConfig from 'virtual:sveltepress/site'
  import { parseImageSrc } from '../utils'

  const { heroImage } = $props()
</script>

<div class="hero-image">
  <img src={parseImageSrc(heroImage)} alt={siteConfig.title} width="192" />
</div>

<style>
  .hero-image {
    --at-apply: 'flex items-center justify-center sm:col-span-5 col-span-6 col-start-4 sm:col-start-8';
  }
  .hero-image img {
    --at-apply: 'sm:w-60 w-full max-w-[220px]';
  }
</style>
