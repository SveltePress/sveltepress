<script lang="ts">
  import Timeline from '@sveltepress/theme-blog/components/Timeline.svelte'
  import { posts } from 'virtual:sveltepress/blog-posts'
</script>

<Timeline {posts} />
