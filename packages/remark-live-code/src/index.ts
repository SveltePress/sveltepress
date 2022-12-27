import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { visit } from 'unist-util-visit'
import { uid } from 'uid'
import type { RemarkLiveCode } from './types'

const BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json')

const liveCode: RemarkLiveCode = function () {
  if (!existsSync(BASE_PATH)) {
    mkdirSync(BASE_PATH, {
      recursive: true,
    })
  }

  if (!existsSync(LIVE_CODE_MAP))
    writeFileSync(LIVE_CODE_MAP, '{}')

  return (tree, vFile) => {
    visit(
      tree,
      (node, idx, parent) => {
        const { meta, lang, type, data } = node

        if (type === 'code'
            && lang === 'svelte'
            && meta?.split(' ').includes('live')
            && idx !== null && !data?.liveCodeResolved) {
          const expansionNode = {
            type: 'html',
            value: `
{#await import('@casual-ui/svelte/dist/components/CExpansion.svelte')}
{:then CExpansion}
  <svelte:component this={CExpansion.default} title="Click fold/expand code" reverse={true}>
`,
          }

          const codeHighlightNode = {
            ...node,
            data: {
              ...node.data,
              liveCodeResolved: true, // mark this node as resolved
            },
          }

          const expansionNodeEnd = {
            type: 'html',
            value: `
</svelte:component>
{:catch err}
  <div text-red-5>Expansion Error: {JSON.stringify(err)}</div>
{/await}
`,
          }
          const idNameMap = JSON.parse(readFileSync(LIVE_CODE_MAP, 'utf-8'))
          // @ts-ignore
          const blockId = `${vFile.filename}-${idx}`
          let name = idNameMap[blockId]
          if (!name) {
            name = idNameMap[blockId] = `LiveCode${uid()}.svelte`
            writeFileSync(LIVE_CODE_MAP, JSON.stringify(idNameMap))
          }

          writeFileSync(resolve(BASE_PATH, name), node.value || '')
          const svelteComponent = {
            type: 'html',
            value: `
{#await import('$live-code/${name}')}
{:then Comp}
  <svelte:component this="{Comp.default}"></svelte:component>
{:catch err}
  <div text-red-5>Live Code Error: {JSON.stringify(err)}</div>
{/await}`,
          }

          const liveCodeNode = {
            type: 'liveCode',
            data: {
              hName: 'div',
              hProperties: {
                'bg-white': '',
                'dark:bg-111111': '',
                'mb-8': '',
                'shadow-sm': '',
                'rounded-md': '',
              },
            },
            children: [
              svelteComponent,
              expansionNode,
              codeHighlightNode,
              expansionNodeEnd,
            ],
          }

          parent.children.splice(idx, 1, liveCodeNode)
        }
      })
  }
}

export default liveCode
