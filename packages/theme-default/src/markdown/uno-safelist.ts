import { classes } from './live-code.js'

export default [
  ...classes,
].reduce<string[]>((r, classStr) => [...r, ...classStr.split(' ')], [])
