import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { defineBuildConfig } from 'unbuild'

const resolvePkgPath = (cwdRelativePath: string) => resolve(process.cwd(), `${cwdRelativePath}/package.json`)

const getPkg = (cwdRelativePath: string) => {
  const absolutePackagePath = resolvePkgPath(cwdRelativePath)
  if (!existsSync(absolutePackagePath)) {
    console.error('package.json path not found: ', absolutePackagePath)
    process.exit(0)
  }

  return JSON.parse(readFileSync(absolutePackagePath, 'utf-8'))
}

const writeDevDependencies = (dependencies: {
  name: string
  version: string
}[], pkgDirs: string[]) => {
  pkgDirs.forEach((pkgDir) => {
    const pkgObj = getPkg(pkgDir)
    if (!('devDependencies' in pkgObj))
      pkgObj.devDependencies = {}

    dependencies.forEach(({ name, version }) => {
      pkgObj.devDependencies[name] = version
    })

    writeFileSync(resolvePkgPath(pkgDir), JSON.stringify(pkgObj, null, 2))
  })
}

export default defineBuildConfig({
  failOnWarn: false,
  hooks: {
    // read the latest vite plugin and default theme package info and write it into templates
    'build:before': async () => {
      writeDevDependencies(
        [
          getPkg('../vite'),
          getPkg('../theme-default'),
        ],
        [
          'template-js',
          'template-ts',
        ],
      )
    },
  },
})
