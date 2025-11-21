import { defineConfig } from 'taze'

export default defineConfig({
  recursive: true,
  force: true,
  write: true,
  install: true,
  depFields: {
    overrides: false,
  },
})
