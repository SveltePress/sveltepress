import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/types',
    'src/highlight/index',
    'src/locale',
    'src/locale-scan',
    'src/hooks',
    'src/versioning/index',
    'src/versioning/runtime',
    'src/theme-snapshot',
  ],
  declaration: true,
  rollup: {
    resolve: {},
    inlineDependencies: true,
  },
  failOnWarn: false,
})
