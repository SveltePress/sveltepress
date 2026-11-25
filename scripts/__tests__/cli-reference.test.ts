import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { runCli } from '../../packages/cli/src/index.js'

// The CLI reference once documented `versions publish --status`, which the
// parser rejects. These tests hold the reference page of every locale to what
// the parser accepts.

const root = fileURLToPath(new URL('../..', import.meta.url))
const cliSource = readFileSync(`${root}packages/cli/src/index.ts`, 'utf8')
const referencePages = {
  en: 'packages/docs-site/src/routes/reference/cli/+page.md',
  zh: 'packages/docs-site/src/routes/zh/reference/cli/+page.md',
  bn: 'packages/docs-site/src/routes/bn/reference/cli/+page.md',
}

/** Parsed for forward compatibility but not read by any command, so not documented. */
const UNDOCUMENTED_OPTIONS = ['--output']

/** Options the argument parser compares against, read from its source. */
const parserOptions = [...new Set([...cliSource.matchAll(/arg === '(--[a-z-]+)'/g)].map(match => match[1]))].sort()

const subcommands = cliSource.match(/versions <([a-z|]+)>/)?.[1].split('|') ?? []

async function parserError(option: string) {
  const errors: string[] = []
  await runCli(['versions', 'not-a-command', option, 'value'], {
    cwd: root,
    stdout: () => {},
    stderr: value => errors.push(value),
  })
  return errors.join('\n')
}

function documentedOptions(markdown: string) {
  return [...new Set([...markdown.matchAll(/`(--[a-z-]+)(?: [^`]*)?`/g)].map(match => match[1]))].sort()
}

function documentedSubcommands(markdown: string) {
  return [...markdown.matchAll(/^### `([a-z]+)`$/gm)].map(match => match[1])
}

describe('the options read from the parser source', () => {
  it('are the ones the parser really accepts', async () => {
    // Guards the regular expression above: if the parser is rewritten and it
    // stops matching, this fails instead of the comparisons passing on nothing.
    expect(parserOptions.length).toBeGreaterThan(5)
    for (const option of parserOptions)
      expect(await parserError(option), option).not.toContain('Unknown option')
    expect(await parserError('--no-such-option')).toContain('Unknown option: --no-such-option')
  })
})

describe.each(Object.entries(referencePages))('reference page of the CLI (%s)', (_locale, path) => {
  const markdown = readFileSync(`${root}${path}`, 'utf8')

  it('documents only options the parser accepts', async () => {
    const rejected: string[] = []
    for (const option of documentedOptions(markdown)) {
      if ((await parserError(option)).includes('Unknown option'))
        rejected.push(option)
    }

    expect(rejected).toEqual([])
  })

  it('documents every option the parser accepts', () => {
    const expected = parserOptions.filter(option => !UNDOCUMENTED_OPTIONS.includes(option))

    expect(documentedOptions(markdown)).toEqual(expected)
  })

  it('has a section for every subcommand, in the order the usage line lists them', () => {
    expect(subcommands.length).toBeGreaterThan(5)
    expect(documentedSubcommands(markdown)).toEqual(subcommands)
  })
})
