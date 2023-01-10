import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { wrapPage } from '../src/wrapPage'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const svelteCode = `
<script context="module">
  export const frontmatter = {
    title: 'some title',
    description: 'some description'
  }
  function abc () {
    const foo = 'bar'
    return foo
  }
  const num = 9 / 3
</script>
<h1>
propName is {propName}
</h1>

<h2>
some h2 content
</h2>
<script>
  export let propName
  const someVariable = 'some value'
</script>
`

describe('add page layout', () => {
  it('wrap svelte', async () => {
    expect(wrapPage({
      id: resolve(__dirname, 'page.svelte'),
      pageLayout: '/path/to/pageLayout',
      fm: {
        title: 'some title',
        description: 'some desc',
      },
      siteConfig: {
        title: 'Site title',
        description: 'Site desc',
      },
      svelteCode,
    })).toMatchSnapshot()
  })

  it('wrap md', async () => {
    expect(wrapPage({
      id: resolve(__dirname, '/src/routes/foo/page.md'),
      pageLayout: '/path/to/pageLayout',
      fm: {
        title: 'some title',
        description: 'some desc',
      },
      siteConfig: {
        title: 'Site title',
        description: 'Site desc',
      },
      svelteCode,
    })).toMatchSnapshot()
  })
})
