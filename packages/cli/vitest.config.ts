import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./__tests__/isolate-git.ts'],
  },
})
