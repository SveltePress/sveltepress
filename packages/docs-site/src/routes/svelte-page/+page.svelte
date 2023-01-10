<script lang="ts" context="module">
  export const frontmatter = {
    title: 'Svelte page',
    description: 'This is a svelte page frontmatter description'
  }
</script>
<script lang="ts">
  import { slide } from 'svelte/transition'
</script>

<div class="text-xl h-100" transition:slide>
  Svelte Page
</div>