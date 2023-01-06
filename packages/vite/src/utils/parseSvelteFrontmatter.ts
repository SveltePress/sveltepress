import { parse } from 'svelte/compiler'
import type { Expression, Pattern, SpreadElement } from 'estree'

/**
 * Parse the svelte source and get the frontmatter
 * For example
 * ```svelte
 * <script context="module">
 *   export const frontmatter = {
 *     title: 'some title',
 *     foo: 'bar'
 *   }
 * </script>
 * ```
 * Code like this would parsed this result
 * ```js
 * {
 *   title: 'some title',
 *   foo: 'bar'
 * }
 * ```
 * @param svelteCode the svelte source code
 */
export function parseSvelteFrontmatter(svelteCode: string) {
  const fm: Record<string, any> = {}
  const ast = parse(svelteCode)
  if (!ast.module)
    return fm
  ast.module.content.body.forEach((line) => {
    if (line.type !== 'ExportNamedDeclaration')
      return
    if (line.declaration?.type !== 'VariableDeclaration')
      return
    if (line.declaration.kind !== 'const')
      return
    const variable = line.declaration.declarations[0]
    if (!variable || variable.type !== 'VariableDeclarator')
      return
    if (variable.id.type !== 'Identifier')
      return
    if (variable.id.name !== 'frontmatter')
      return
    if (!variable.init)
      return
    if (variable.init.type !== 'ObjectExpression')
      return
    variable.init.properties.forEach((prop) => {
      if (prop.type !== 'Property')
        return
      if (prop.key.type !== 'Identifier')
        return
      const keyName = prop.key.name
      recursivelySetValue(fm, keyName, prop.value)
    })
  })

  return fm
}

function recursivelySetValue(fm: Record<string, any>, keyName: string | number, value: Expression | Pattern | SpreadElement | null) {
  switch (value?.type) {
    case 'Literal':
      fm[keyName] = value.value
      break
    case 'ArrayExpression':
      fm[keyName] = []
      value.elements.forEach((ele, i) => {
        recursivelySetValue(fm[keyName], i, ele)
      })
      break
    case 'ObjectExpression':
      fm[keyName] = {}
      value.properties.forEach((prop) => {
        if (prop.type === 'Property') {
          if (prop.key.type === 'Identifier')
            recursivelySetValue(fm[keyName], prop.key.name, prop.value)
        }
      })
  }
}
