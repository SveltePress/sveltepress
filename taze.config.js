import { defineConfig } from 'taze'

export default defineConfig({
  exclude: [
    'vite',
    '@sveltejs/kit',
  ],
  recursive: true,
  force: true,
  write: true,
  install: true,
  packageMode: {
  },
  depFields: {
    overrides: false,
  },
})
