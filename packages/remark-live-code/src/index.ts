  
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { visit } from 'unist-util-visit'
import { uid } from 'uid'
import type { RemarkLiveCode } from './types'

const BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json')

const ERROR_CLASSES = 'text-red-5'
const CONTAINER_CLASSES = 'mb-8 shadow-sm'
const DEMO_CLASSES = 'bg-white rounded-t p-4 b-t-1 b-x-1 b-gray-2 b-t-solid b-x-solid'

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
          const expansionNodeStart = {
            type: 'html',
            value: `
{#await import('@svelte-press/vite/CExpansion.svelte')}
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
  <div class="${ERROR_CLASSES}">Expansion Error: {JSON.stringify(err)}</div>
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
{#await import('$sveltepress/live-code/${name}')}
{:then Comp}
  <div class="${DEMO_CLASSES}">
    <svelte:component this="{Comp.default}"></svelte:component>
  </div>
{:catch err}
  <div class="${ERROR_CLASSES}">Live Code Error: {JSON.stringify(err)}</div>
{/await}`,
          }

          const liveCodeNode = {
            type: 'liveCode',
            data: {
              hName: 'div',
              hProperties: {
                className: CONTAINER_CLASSES,
              },
            },
            children: [
              svelteComponent,
              expansionNodeStart,
              codeHighlightNode,
              expansionNodeEnd,
            ],
          }

          parent.children.splice(idx, 1, liveCodeNode)
        }
      })
  }
}

export const safelist = [
  ERROR_CLASSES, 
  DEMO_CLASSES, 
  CONTAINER_CLASSES
].reduce<string[]>((r, classStr) => [...r, ...classStr.split(' ')], [])

export default liveCode
