<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import { posts } from 'virtual:sveltepress/blog-posts'
</script>

<MasonryGrid {posts} />
