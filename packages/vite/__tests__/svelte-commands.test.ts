import { describe, expect, it } from 'vitest'
import mdToSvelte from '../src/markdown/md-to-svelte'

describe('svelte built-in commands', async () => {
  it('commands', async () => {
    const template = `<script>
  const items = ['foo', 'bar', 'zoo']
  const boolValue = false
</script>
  
<ul>

{#each items as item, i}
{@const str = \`\${i + 1}:\${item}\`}
<li>
{item}
</li>
  
{/each}

</ul>

{#if boolValue}
  <h3>
    True
  </h3>
{:else if items}
  <h3>
    items
  </h3>
{:else}
  <h3>
    False
  </h3>
{/if}

{#await Promise.reject('Hello')}
  Loading
{:then val}
  <h1>Val: {val}</h1>
{:catch err}
  <div class="text-gray-8">
  {err.message}
  </div>
{/await}

:i[content]{.blue.green a=b}

::hr[Title]{.red}

{@debug items}

{@html "<div class="foo">Foo</div>"}
`
    const res = await mdToSvelte({
      mdContent: template,
      filename: 'svelte-commands.md',
    })
    expect(res.code).toMatchSnapshot()
  })
})
