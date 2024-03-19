import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

export const importRe = /^@code\(([\.*\/\S*]+)(,\d+(,\d+)?)?\)/

const codeImport: Plugin<any[], any> = () => {
  return async (tree, vFile) => {
    visit(tree, (node, idx, parent) => {
      if (node.type === 'paragraph' && node.children) {
        const [textNode] = node.children
        if (textNode && textNode.type === 'text') {
          const matches = importRe.exec(textNode.value)
          if (matches) {
            const [, params] = matches
            if (params) {
              const [path, start, end] = params.split(',')
              const lang = path.split('/').pop()?.split('.').pop()

              const filename = vFile.path
              if (!filename)
                return
              const absolutePathArray = filename.split('/')
              absolutePathArray.pop()
              const dir = absolutePathArray.join('/')
              const realPath = path.startsWith('.') ? resolve(dir, path) : resolve(process.cwd(), `.${path}`)
              if (existsSync(realPath)) {
                let valueArr = readFileSync(realPath, 'utf-8').split('\n')
                const startLine = Number(start)
                const endLine = Number(end)
                if (!Number.isNaN(startLine)) {
                  valueArr = valueArr.slice(startLine - 1)
                  if (!Number.isNaN(endLine) && endLine > startLine)
                    valueArr = valueArr.slice(0, endLine - startLine + 1)
                }
                if (valueArr.length) {
                  const firstLine = valueArr[0]
                  const initialBlankNumbers = firstLine.length - firstLine.trimStart().length
                  if (initialBlankNumbers > 0)
                    valueArr = valueArr.map(line => line.replace(new RegExp(`^ {${initialBlankNumbers}}`), ''))
                }
                if (!valueArr[0].startsWith('// @noErrors') && lang === 'ts')
                  valueArr.unshift('// @noErrors')

                const codeStr = valueArr.join('\n')
                const node = {
                  type: 'code',
                  lang,
                  value: codeStr.endsWith(',') ? codeStr.slice(0, codeStr.length - 1) : codeStr,
                }
                parent.children.splice(idx, 1, node)
              }
            }
          }
        }
      }
    })
  }
}

export default codeImport
