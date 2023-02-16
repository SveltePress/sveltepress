import { describe, expect, it } from 'vitest'
import { wrapSvelteCode } from '../src/utils/wrap-page'

const source = `
<script context="module">
  export const someVar = 'some value'
</script>
<script>
import SomeComponent from '/path/to/SomeComponent.svelte'

let innerWidth
</script>

<svelte:body on:scroll></svelte:body>

<svelte:head>
  <style>
    .foo {
      color: red;
    }
  </style>
  <script>
    var map = null
  </script>
</svelte:head>

# Title Level 1

Paragraph

<SomeComponent />

<svelte:window bind:innerWidth={innerWidth}></svelte:window>

<style>
  h1 {
    color: blue;
  }
</style>
`

describe('wrap svelte code', () => {
  it('with script, style and context script', () => {
    expect(wrapSvelteCode({
      svelteCode: source,
      fm: {
        title: 'title',
      },
      pageLayout: '/path/to/PageLayout.svelte',
    })).toMatchSnapshot()
  })
})
