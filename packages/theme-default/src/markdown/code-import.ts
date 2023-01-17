import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const importRe = /^@code\(([\.*\/\S*]+)\)/

const codeImport: Plugin<any[], any> = () => {
  return async (tree, vFile) => {
    visit(tree, (node, idx, parent) => {
      if (node.type === 'paragraph' && node.children) {
        const [textNode] = node.children
        if (textNode && textNode.type === 'text') {
          const matches = importRe.exec(textNode.value)
          if (matches) {
            const [, path] = matches
            if (path) {
              const lang = path.split('/').pop().split('.').pop()
              // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const absolutePathArray = vFile.filename.split('/')
              absolutePathArray.pop()
              const dir = absolutePathArray.join('/')
              const realPath = path.startsWith('.') ? resolve(dir, path) : resolve(process.cwd(), `.${path}`)
              if (existsSync(realPath)) {
                const node = {
                  type: 'code',
                  lang,
                  value: readFileSync(realPath, 'utf-8'),
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
