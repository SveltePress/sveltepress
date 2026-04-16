<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte'

  const { data } = $props()
  const category = $derived(data.category)
  const posts = $derived(data.posts)
</script>

<TaxonomyHeader name={category} count={posts.length} type="category" />
<MasonryGrid {posts} />
