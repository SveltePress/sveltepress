<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import Pagination from '@sveltepress/theme-blog/components/Pagination.svelte'

  const { data } = $props()
  const posts = $derived(data.posts)
</script>

<MasonryGrid {posts} />
<Pagination page={data.page} total={data.total} pageSize={data.pageSize} />
