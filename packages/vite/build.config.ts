import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  rollup: {
    resolve: {},
    inlineDependencies: true,
  },
  failOnWarn: false,
})
