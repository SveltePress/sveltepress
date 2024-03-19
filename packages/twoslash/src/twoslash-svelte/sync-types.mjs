import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

const svelte2TsxTypes = readFileSync(resolve(cwd(), 'node_modules/svelte2tsx/svelte-shims-v4.d.ts'), 'utf-8')

writeFileSync(resolve(cwd(), 'src/twoslash-svelte/types-template.d.ts'), [
  'declare const svelteHTML: any',
  svelte2TsxTypes.split('\n').filter(line => !line.includes('__sveltets_2_snippet') && !line.includes('NodeJS.Process')).join('\n'),
].join('\n'), 'utf-8')

export {}
