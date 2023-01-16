import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { visit } from 'unist-util-visit'
import { uid } from 'uid'
import type { RemarkLiveCode } from '../types'

const BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json')

const ERROR_CLASSES = 'text-red-5'
const CONTAINER_CLASSES = 'mb-8 shadow-sm'
const DEMO_CLASSES = 'bg-white dark:bg-warm-gray-8 rounded-t p-4 b-t-1 b-x-1 b-gray-2 dark:b-warmgray-9 b-t-solid b-x-solid'
const ICON_LOADING_CLASSES = 'text-lg text-gray-4'

const expansionImporter = 'import CExpansion from \'@svelte-press/theme-default/CExpansion.svelte\''
const linkImporter = 'import Link from \'@svelte-press/theme-default/Link.svelte\''

const globalComponentsImporters = [
  expansionImporter,
  linkImporter,
]

const liveCode: RemarkLiveCode = function () {
  if (!existsSync(BASE_PATH)) {
    mkdirSync(BASE_PATH, {
      recursive: true,
    })
  }

  if (!existsSync(LIVE_CODE_MAP))
    writeFileSync(LIVE_CODE_MAP, '{}')

  let hasScript = false
  const liveCodePaths = []
  return (tree, vFile) => {
    visit(
      tree,
      (node, idx, parent) => {
        const { meta, lang, type, data } = node
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
            const svelteFileName = `LiveCode${uid()}`
            name = idNameMap[blockId] = `${svelteFileName}.svelte`
            writeFileSync(LIVE_CODE_MAP, JSON.stringify(idNameMap, null, 2))
          }

          const path = resolve(BASE_PATH, name)
          writeFileSync(path, node.value || '')
          liveCodePaths.push({
            componentName: name.replace(/\.svelte$/, ''),
            path,
          })

          const svelteComponent = {
            type: 'html',
            value: `<div class="${DEMO_CLASSES}"><${name.replace(/\.svelte$/, '')} /></div>`,
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
              {
                type: 'html',
                value: '<CExpansion title="Click fold/expand code" reverse={true}>',
              },
              codeHighlightNode,
              {
                type: 'html',
                value: '</CExpansion>',
              },
            ],
          }

          parent.children.splice(idx, 1, liveCodeNode)
        }
      })

    const liveCodeImports = liveCodePaths.map(({ componentName, path }) => `import ${componentName} from '${path}'`)

    visit(tree, (node, idx, parent) => {
      if (node.type === 'html' && node.value.startsWith('<script') && !hasScript) {
        hasScript = true
        parent.children.splice(idx, 1, {
          type: 'html',
          value: node.value.replace(/^<script[ \w+="\w+"]+>/, m =>
            [m, ...globalComponentsImporters, ...liveCodeImports].join('\n')),
        })
      }
    })

    if (!hasScript) {
      tree.children.unshift({
        type: 'html',
        value: ['<script>', ...globalComponentsImporters, ...liveCodeImports, '</script>'].join('\n'),
      })
    }
  }
}

export const classes = [
  ERROR_CLASSES,
  DEMO_CLASSES,
  CONTAINER_CLASSES,
  ICON_LOADING_CLASSES,
]

export default liveCode
