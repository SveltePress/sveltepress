import fg from 'fast-glob'

export async function getPages() {
  return (await fg('src/routes/**/+page.(md|svelte)'))
}
