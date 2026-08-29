import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['check-utils.test.mjs'],
  },
})
