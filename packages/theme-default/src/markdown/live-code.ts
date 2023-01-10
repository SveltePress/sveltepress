import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { visit } from 'unist-util-visit'
import { uid } from 'uid'
import type { RemarkLiveCode } from '../types'

const BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json')

const ERROR_CLASSES = 'text-red-5'
const CONTAINER_CLASSES = 'mb-8 shadow-sm'
const DEMO_CLASSES = 'bg-white dark:bg-warmgray-8 rounded-t p-4 b-t-1 b-x-1 b-gray-2 dark:b-warmgray-9 b-t-solid b-x-solid'
const ICON_LOADING_CLASSES = 'text-lg text-gray-4'

const ICON_LOADING = `<svg class="${ICON_LOADING_CLASSES}" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity=".5"/><path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"><animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate"/></path></svg>`

const expansionImporter = 'import CExpansion from \'@svelte-press/theme-default/CExpansion.svelte\''

const expansionNodeStart = {
  type: 'html',
  value: '<CExpansion title="Click fold/expand code" reverse={true}>',
}

const expansionNodeEnd = {
  type: 'html',
  value: '</CExpansion>',
}

const liveCode: RemarkLiveCode = function () {
  if (!existsSync(BASE_PATH)) {
    mkdirSync(BASE_PATH, {
      recursive: true,
    })
  }

  if (!existsSync(LIVE_CODE_MAP))
    writeFileSync(LIVE_CODE_MAP, '{}')

  let hasScript = false
  return (tree, vFile) => {
    visit(
      tree,
      (node, idx, parent) => {
        const { meta, lang, type, data } = node
        if (type === 'html' && node.value.startsWith('<script') && !hasScript) {
          hasScript = true
          parent.children.splice(idx, 1, {
            type: 'html',
            value: node.value.replace(/^<script[ \w+="\w+"]+>/, m => [m, expansionImporter].join('\n')),
          })
          return
        }

        if (type === 'code'
            && lang === 'svelte'
            && meta?.split(' ').includes('live')
            && idx !== null && !data?.liveCodeResolved
        ) {
          const codeHighlightNode = {
            ...node,
            data: {
              ...node.data,
              liveCodeResolved: true, // mark this node as resolved
            },
          }

          const idNameMap = JSON.parse(readFileSync(LIVE_CODE_MAP, 'utf-8'))
          // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const blockId = `${vFile.filename}-${idx}`
          let name = idNameMap[blockId]
          if (!name) {
            name = idNameMap[blockId] = `LiveCode${uid()}.svelte`
            writeFileSync(LIVE_CODE_MAP, JSON.stringify(idNameMap, null, 2))
          }

          writeFileSync(resolve(BASE_PATH, name), node.value || '')

          const svelteComponent = {
            type: 'html',
            value: `
{#await import('$sveltepress/live-code/${name}')}
  ${ICON_LOADING}
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
    if (!hasScript) {
      tree.children.unshift({
        type: 'html',
        value: ['<script>', expansionImporter, '</script>'].join('\n'),
      })
    }
  }
}

export const safelist = [
  ERROR_CLASSES,
  DEMO_CLASSES,
  CONTAINER_CLASSES,
  ICON_LOADING_CLASSES,
].reduce<string[]>((r, classStr) => [...r, ...classStr.split(' ')], [])

export default liveCode
