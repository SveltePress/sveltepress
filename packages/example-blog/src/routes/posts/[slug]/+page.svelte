<script lang="ts">
  import PostLayout from '@sveltepress/theme-blog/PostLayout.svelte'

  const { data } = $props()
  const post = $derived(data.post)
  const prev = $derived(data.prev)
  const next = $derived(data.next)
</script>

<PostLayout {post} {prev} {next} />
