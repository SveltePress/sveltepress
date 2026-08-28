import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/cli'],
  declaration: true,
  rollup: {
    inlineDependencies: true,
  },
  failOnWarn: false,
})
