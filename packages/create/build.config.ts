import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineBuildConfig } from 'unbuild'

const resolvePkgPath = (cwdRelativePath: string) => resolve(process.cwd(), `${cwdRelativePath}/package.json`)

function getPkg(cwdRelativePath: string) {
  const absolutePackagePath = resolvePkgPath(cwdRelativePath)
  if (!existsSync(absolutePackagePath)) {
    console.error('package.json path not found: ', absolutePackagePath)
    process.exit(0)
  }

  return JSON.parse(readFileSync(absolutePackagePath, 'utf-8'))
}

interface Dependency {
  name: string
  version: string
}

function writeDevDependencies(dependencies: Dependency[], pkgDirs: string[]) {
  pkgDirs.forEach(pkgDir => {
    const pkgObj = getPkg(pkgDir)
    if (!('devDependencies' in pkgObj))
      pkgObj.devDependencies = {}

    dependencies.forEach(({ name, version }) => {
      pkgObj.devDependencies[name] = version
    })

    writeFileSync(resolvePkgPath(pkgDir), JSON.stringify(pkgObj, null, 2))
  })
}

function padStartWithVersion(dependencies: Dependency[]) {
  dependencies.forEach(dep => {
    dep.version = `^${dep.version}`
  })
}

function writePackages() {
  const dependencies = [
    getPkg('../vite'),
    getPkg('../theme-default'),
  ]
  padStartWithVersion(dependencies)
  // write the newest version of @sveltepress/vite and @sveltepress/theme-default package to templates
  writeDevDependencies(
    dependencies,
    [
      'template-js',
      'template-ts',
    ],
  )
}

export default defineBuildConfig({
  failOnWarn: false,
  hooks: {
    'build:before': async () => {
      // read the latest vite plugin and default theme package info and write it into templates
      writePackages()
    },
  },
})
