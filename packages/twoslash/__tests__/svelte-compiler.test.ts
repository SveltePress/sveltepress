import { describe, expect, it } from 'vitest'
import { parse, preprocess } from 'svelte/compiler'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const code = `
<script context="module" lang="ts">
  export const FOO = 'BAR'
</script>
<script lang="ts">
  import { onMount } from 'svelte'

  let count = 0

  onMount(() => {
    console.log('mount')
  })
</script>
<button on:click="{count++}">
  Count is: { count }
</button>
`

describe('svelte compiler', () => {
  it('preprocess', async () => {
    expect(await preprocess(code, vitePreprocess())).toMatchSnapshot()
  })

  it('parse', async () => {
    expect(parse(code)).toMatchSnapshot()
  })
})
