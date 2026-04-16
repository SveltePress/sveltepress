---
title: Vitest in Practice
date: 2026-03-28
tags: [testing, vitest, tooling]
category: Tutorials
author: Demo Author
---

# Vitest in Practice

Vitest is Vite's test runner — it reuses your Vite config, so ESM, TypeScript, and path aliases just work.

## Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.test.ts'],
    globals: true,
  },
})
```

## Snapshot Tests

Snapshots shine for transformation pipelines — markdown → HTML, AST → output, etc.:

```ts
import { expect, test } from 'vitest'
import { process } from '../src/process.ts'

test('processes headings', () => {
  expect(process('# Hello')).toMatchSnapshot()
})
```

Review snapshot diffs carefully — they're only as good as the reviewer.

## Watch Mode

`vitest` (without `run`) enters watch mode by default. Only tests affected by changed files re-run. Fast feedback.
