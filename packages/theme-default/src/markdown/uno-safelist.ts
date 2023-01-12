import { classes } from './live-code.js'
import { classes as hClasses } from './highlighter.js'

export default [
  ...classes,
  ...hClasses,
].reduce<string[]>((r, classStr) => [...r, ...classStr.split(' ')], [])
