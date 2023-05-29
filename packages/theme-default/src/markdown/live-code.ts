import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { visit } from 'unist-util-visit'
import { uid } from 'uid'
import type { Plugin } from 'unified'
import { mdToSvelte } from '@sveltepress/vite'
import { themeOptionsRef } from '../index.js'
import highlighter from './highlighter.js'
import admonitions from './admonitions.js'
import anchors from './anchors.js'
import links from './links.js'
import codeImport from './code-import.js'
import installPkg from './install-pkg.js'

const BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json')

const SUPPORTED_LIVE_LANGS = ['svelte', 'md'] as const
type SupportedLiveLang = typeof SUPPORTED_LIVE_LANGS[number]

interface LiveCodePathItem {
  componentName: string
  path: string
}

const globalComponentsImporters = [
  'import { Expansion, Link, CopyCode, Tabs, TabPanel, InstallPkg, IconifyIcon } from \'@sveltepress/theme-default/components\'',
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
  const liveCodePaths: LiveCodePathItem[] = []

  return async (tree, vFile) => {
    const asyncNodeOperations: Promise<any>[] = []
    visit(
      tree,
      (node, idx, parent) => {
        const { meta, lang, type, data } = node
        if (type === 'code' &&
            SUPPORTED_LIVE_LANGS.includes(lang) &&
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

          const getLiveNodeFromLang = async (lang: SupportedLiveLang) => {
            if (lang === 'svelte') {
              const idNameMap = JSON.parse(readFileSync(LIVE_CODE_MAP, 'utf-8'))

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
              return svelteComponent
            } else if (lang === 'md') {
              const renderedHTML = (await mdToSvelte({
                mdContent: node.value,
                filename: vFile.path,
                highlighter,
                remarkPlugins: [
                  admonitions,
                  links,
                  anchors,
                  codeImport,
                  installPkg,
                ],
              })).code
              return {
                type: 'html',
                value: `<div class="svp-live-code--demo">${renderedHTML}</div>`,
              }
            }
          }

          const asyncAdd = async () => {
            const liveCodeNode = {
              type: 'liveCode',
              data: {
                hName: 'div',
                hProperties: {
                  className: 'svp-live-code--container',
                },
              },
              children: [
                await getLiveNodeFromLang(lang),
                {
                  type: 'html',
                  value: `<Expansion codeType="${lang}" title="${themeOptionsRef.value?.i18n?.expansionTitle || 'Click fold/expand code'}" reverse={true}>`,
                },
                codeHighlightNode,
                {
                  type: 'html',
                  value: '</Expansion>',
                },
              ],
            }

            parent.children.splice(idx, 1, liveCodeNode)
          }

          asyncNodeOperations.push(asyncAdd())
        }
      })
    await Promise.all(asyncNodeOperations)
    const liveCodeImports = liveCodePaths.map(({ componentName, path }) => `import ${componentName} from '${path}'`)

    visit(tree, (node, idx, parent) => {
      if (node.type === 'html' && node.value.startsWith('<script') && !hasScript) {
        hasScript = true
        const value = node.value.replace(/^<script[ \w+="\w+"]*>/, (m: string) =>
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
