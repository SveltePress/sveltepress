import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/types',
    'src/highlight/index',
    'src/versioning/index',
    'src/theme-snapshot',
  ],
  declaration: true,
  rollup: {
    resolve: {},
    inlineDependencies: true,
  },
  failOnWarn: false,
})
