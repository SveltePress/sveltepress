// @ts-nocheck
import { writeFileSync } from 'node:fs'
import { cwd } from 'node:process'
import { $ } from 'zx'

$.cwd = cwd()

async function createChangeset() {
  const mdContent = `---
'@sveltepress/create': patch
'@sveltepress/theme-default': patch
'@sveltepress/twoslash': patch
'@sveltepress/vite': patch
---

chore: update deps
`
  writeFileSync(`.changeset/${generateRandomWords(3)}.md`, mdContent)
}

function generateRandomWords(num, wordLength = 5, separator = '-') {
  const words = []
  const possible = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < num; i++) {
    let word = ''
    for (let j = 0; j < wordLength; j++) {
      word += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    words.push(word)
  }
  return words.join(separator)
}

async function createGitCommit() {
  await $`git config user.name "Dongsheng Zhao"`
  await $`git config user.email "1197160272@qq.com"`
  await $`git add -A`
  await $`git commit -a -m "chore: update deps"`
  await $`git push`
}

async function main() {
  const gitStatusLines = (await $`git status`).toString().split('\n')
  if (
    gitStatusLines.some(line => line.startsWith('Untracked files:')
      || line.startsWith('Changes not staged for commit:'
        || line.startsWith('Changes to be committed:'))
      || line.includes('modified:'))
  ) {
    await createChangeset()
    await createGitCommit()
  }
}

main()
