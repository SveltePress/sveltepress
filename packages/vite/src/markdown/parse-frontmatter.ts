import type { Plugin } from 'unified'

const parseFrontmatter: Plugin<any[], any> = () => {
  return (tree, vFile) => {
    console.log(vFile)
  }
}

export default parseFrontmatter
