import { defineConfig } from 'vitest/config'

// A config of its own: without one vitest walks up to the workspace root
// config, which only lists other packages as projects.
export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
  },
})
