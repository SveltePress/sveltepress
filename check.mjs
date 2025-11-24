// @ts-nocheck
import { cwd } from 'node:process'
import { $ } from 'zx'

$.cwd = cwd()

async function createChangeset() {
  const changesetRes = $`npx changeset`
  let checked = false
  changesetRes.stdout.on('data', (e) => {
    const output = e.toString()

    if (output.includes('Summary')) {
      changesetRes.stdin.write('chore: update deps \n')
      return
    }
    if (output.includes('Which packages should have a major bump?')) {
      changesetRes.stdin.write('\n')
      return
    }
    if (output.includes('Which packages would you like to include?')) {
      if (!checked) {
        checked = true
        changesetRes.stdin.write(' ')
      }
      else {
        changesetRes.stdin.write('\n')
      }
    }
  })
  return await changesetRes
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
