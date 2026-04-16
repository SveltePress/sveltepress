<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte'

  const { data } = $props()
  const tag = $derived(data.tag)
  const posts = $derived(data.posts)
</script>

<TaxonomyHeader name={tag} count={posts.length} type="tag" />
<MasonryGrid {posts} />
