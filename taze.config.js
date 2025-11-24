import { defineConfig } from 'taze'

export default defineConfig({
  recursive: true,
  force: true,
  write: true,
  install: false,
  depFields: {
    overrides: false,
  },
})
