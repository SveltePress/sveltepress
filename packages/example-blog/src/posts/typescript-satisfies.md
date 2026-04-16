---
title: The `satisfies` Operator in TypeScript
date: 2026-04-08
tags: [typescript, types]
category: Tutorials
author: Demo Author
---

# The `satisfies` Operator in TypeScript

`satisfies` validates that an expression matches a type **without widening** the inferred type. It's subtly different from a type annotation.

## The Problem

```ts
const config: Record<string, string | number> = {
  port: 3000,
  host: 'localhost',
}

// config.port is `string | number`, not `number` 😞
```

## The Fix

```ts
const config = {
  port: 3000,
  host: 'localhost',
} satisfies Record<string, string | number>

// config.port is `number` ✅
// config.host is `string` ✅
```

## When to Use

Use `satisfies` when you want type *checking* but not type *widening* — perfect for configuration objects, route maps, and discriminated unions.
