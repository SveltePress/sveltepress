import { defineConfig } from 'taze'

export default defineConfig({
  exclude: [
    '@iconify/utils',
    'unocss',
  ],
  recursive: true,
  force: true,
  write: true,
  install: true,
  depFields: {
    overrides: false,
  },
})
