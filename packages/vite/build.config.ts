import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/types',
    'src/highlight/index',
  ],
  declaration: true,
  rollup: {
    resolve: {},
    inlineDependencies: true,
  },
  failOnWarn: false,
})
