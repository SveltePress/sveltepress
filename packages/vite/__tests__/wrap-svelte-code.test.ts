import { describe, expect, it } from 'vitest'
import { wrapSvelteCode } from '../src/utils/wrapPage'

const source = `
<script context="module">
  import PageLayout from '@svelte-press/theme-default/PageLayout.svelte'
  const fm = {"pageType":"md","lastUpdate":"2023/01/16 11:40:48","title":"Home Page","heroImage":"/sveltepress@3x.png","tagline":"A simple, easy to use, content centered site build tool with the full power of Sveltekit.","actions":[{"label":"Read the docs","to":"/guide/introduction/","type":"primary"},{"label":"View on github","type":"flat","to":"https://github.com/Blackman99/sveltepress","external":true}],"features":[{"title":"Markdown centered","description":"To help you can start writing with minimal configuration."},{"title":"Build with Sveltekit","description":"Preserve the full power of Sveltekit. So that you can do more than SSG."},{"title":"Svelte in Markdown","description":"Feel free to use svelte in markdown. Explore infinite possibilities."},{"title":"Type friendly","description":"All APIs are fully typed with typescript."},{"title":"Theme Customizable","description":"Feel free to use default theme, community themes or write your own."}],"anchors":[]}
  const siteConfig = {"title":"Sveltepress","description":"A content centered site build tool"}
  export const metadata = {"title":"Home Page","heroImage":"/sveltepress@3x.png","tagline":"A simple, easy to use, content centered site build tool with the full power of Sveltekit.","actions":[{"label":"Read the docs","to":"/guide/introduction/","type":"primary"},{"label":"View on github","type":"flat","to":"https://github.com/Blackman99/sveltepress","external":true}],"features":[{"title":"Markdown centered","description":"To help you can start writing with minimal configuration."},{"title":"Build with Sveltekit","description":"Preserve the full power of Sveltekit. So that you can do more than SSG."},{"title":"Svelte in Markdown","description":"Feel free to use svelte in markdown. Explore infinite possibilities."},{"title":"Type friendly","description":"All APIs are fully typed with typescript."},{"title":"Theme Customizable","description":"Feel free to use default theme, community themes or write your own."}]};
  const { title, heroImage, tagline, actions, features } = metadata;
</script>
<script>
import CExpansion from '@svelte-press/theme-default/CExpansion.svelte'
import Link from '@svelte-press/theme-default/Link.svelte'
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
        <script context=\\"module\\">
      import PageLayout from '/path/to/PageLayout.svelte'
      const fm = {\\"title\\":\\"title\\"}
      const siteConfig = {\\"title\\":\\"Site title\\",\\"description\\":\\"Site desc\\"}
        import PageLayout from '@svelte-press/theme-default/PageLayout.svelte'
        const fm = {\\"pageType\\":\\"md\\",\\"lastUpdate\\":\\"2023/01/16 11:40:48\\",\\"title\\":\\"Home Page\\",\\"heroImage\\":\\"/sveltepress@3x.png\\",\\"tagline\\":\\"A simple, easy to use, content centered site build tool with the full power of Sveltekit.\\",\\"actions\\":[{\\"label\\":\\"Read the docs\\",\\"to\\":\\"/guide/introduction/\\",\\"type\\":\\"primary\\"},{\\"label\\":\\"View on github\\",\\"type\\":\\"flat\\",\\"to\\":\\"https://github.com/Blackman99/sveltepress\\",\\"external\\":true}],\\"features\\":[{\\"title\\":\\"Markdown centered\\",\\"description\\":\\"To help you can start writing with minimal configuration.\\"},{\\"title\\":\\"Build with Sveltekit\\",\\"description\\":\\"Preserve the full power of Sveltekit. So that you can do more than SSG.\\"},{\\"title\\":\\"Svelte in Markdown\\",\\"description\\":\\"Feel free to use svelte in markdown. Explore infinite possibilities.\\"},{\\"title\\":\\"Type friendly\\",\\"description\\":\\"All APIs are fully typed with typescript.\\"},{\\"title\\":\\"Theme Customizable\\",\\"description\\":\\"Feel free to use default theme, community themes or write your own.\\"}],\\"anchors\\":[]}
        const siteConfig = {\\"title\\":\\"Sveltepress\\",\\"description\\":\\"A content centered site build tool\\"}
        export const metadata = {\\"title\\":\\"Home Page\\",\\"heroImage\\":\\"/sveltepress@3x.png\\",\\"tagline\\":\\"A simple, easy to use, content centered site build tool with the full power of Sveltekit.\\",\\"actions\\":[{\\"label\\":\\"Read the docs\\",\\"to\\":\\"/guide/introduction/\\",\\"type\\":\\"primary\\"},{\\"label\\":\\"View on github\\",\\"type\\":\\"flat\\",\\"to\\":\\"https://github.com/Blackman99/sveltepress\\",\\"external\\":true}],\\"features\\":[{\\"title\\":\\"Markdown centered\\",\\"description\\":\\"To help you can start writing with minimal configuration.\\"},{\\"title\\":\\"Build with Sveltekit\\",\\"description\\":\\"Preserve the full power of Sveltekit. So that you can do more than SSG.\\"},{\\"title\\":\\"Svelte in Markdown\\",\\"description\\":\\"Feel free to use svelte in markdown. Explore infinite possibilities.\\"},{\\"title\\":\\"Type friendly\\",\\"description\\":\\"All APIs are fully typed with typescript.\\"},{\\"title\\":\\"Theme Customizable\\",\\"description\\":\\"Feel free to use default theme, community themes or write your own.\\"}]};
        const { title, heroImage, tagline, actions, features } = metadata;
      </script>
      <script>
      import CExpansion from '@svelte-press/theme-default/CExpansion.svelte'
      import Link from '@svelte-press/theme-default/Link.svelte'
      </script>
      <PageLayout {fm} {siteConfig}>
        



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
