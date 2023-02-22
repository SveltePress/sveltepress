import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { visit } from 'unist-util-visit'
import { uid } from 'uid'
import type { Plugin } from 'unified'

const BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json')

const globalComponentsImporters = [
  'import CExpansion from \'@sveltepress/theme-default/CExpansion.svelte\'',
  'import Link from \'@sveltepress/theme-default/Link.svelte\'',
  'import CopyCode from \'@sveltepress/theme-default/CopyCode.svelte\'',
  'import Tabs from \'@sveltepress/theme-default/Tabs.svelte\'',
  'import TabPanel from \'@sveltepress/theme-default/TabPanel.svelte\'',
  'import InstallPkg from \'@sveltepress/theme-default/InstallPkg.svelte\'',
]

const liveCode: Plugin<[], any> = function () {
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
        if (type === 'code' &&
            lang === 'svelte' &&
            meta?.split(' ').includes('live') &&
            idx !== null && !data?.liveCodeResolved
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
          const blockId = `${vFile.path}-${idx}`

          let name = idNameMap[blockId]
          if (!name) {
            const svelteFileName = `LiveCode${uid()}`
            name = idNameMap[blockId] = `${svelteFileName}.svelte`
            writeFileSync(LIVE_CODE_MAP, JSON.stringify(idNameMap, null, 2))
          }

          const path = resolve(BASE_PATH, name)
          writeFileSync(path, node.value || '')

          const componentName = name.replace(/\.svelte$/, '')

          liveCodePaths.push({
            componentName,
            path: `$sveltepress/live-code/${name}`,
          })

          const svelteComponent = {
            type: 'html',
            value: `<div class="svp-live-code--demo"><${componentName} /></div>`,
          }

          const liveCodeNode = {
            type: 'liveCode',
            data: {
              hName: 'div',
              hProperties: {
                className: 'svp-live-code--container',
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
        const value = node.value.replace(/^<script[ \w+="\w+"]*>/, m =>
          [m, ...globalComponentsImporters, ...liveCodeImports].join('\n'))
        parent.children.splice(idx, 1, {
          type: 'html',
          value,
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

export default liveCode
