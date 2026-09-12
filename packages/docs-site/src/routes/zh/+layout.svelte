<script>
  const { children } = $props()
</script>

<svelte:head>
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:title" content="面向文档与博客的 SvelteKit 站点构建工具" />
  <meta
    property="og:description"
    content="用 Markdown 写作，保留 SvelteKit 完整能力"
  />
  <meta property="og:image" content="https://sveltepress.site/og-zh.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://sveltepress.site/og-zh.png" />
</svelte:head>

{@render children?.()}
