import { describe, expect, it } from 'vitest'
import { wrapSvelteCode } from '../src/utils/wrapPage'

const source = `<script>
  import Foo from './Foo.svelte'
</script>

<h1>Some content</h1>

<script context="module">
  const a = 'a'
</script>

<h1>Some other content</h1>

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
      siteConfig: {
        title: 'Site title',
        description: 'Site desc',
      },
      pageLayout: '/path/to/PageLayout.svelte',
    })).toMatchInlineSnapshot(`
      "
        <script>
      import PageLayout from '/path/to/PageLayout.svelte'
      const fm = {\\"title\\":\\"title\\"}
      const siteConfig = {\\"title\\":\\"Site title\\",\\"description\\":\\"Site desc\\"}
        import Foo from './Foo.svelte'
      </script>
      <script context=\\"module\\">
        const a = 'a'
      </script>
      <PageLayout {fm} {siteConfig}>
        

      <h1>Some content</h1>



      <h1>Some other content</h1>



      </PageLayout>
      <style>
        h1 {
          color: blue;
        }
      </style>
      "
    `)
  })
})
