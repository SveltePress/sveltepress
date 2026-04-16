---
title: Svelte 5 Runes — Reactivity Reimagined
date: 2026-03-20
tags: [svelte, runes, reactivity]
category: Tutorials
author: Demo Author
---

# Svelte 5 Runes — Reactivity Reimagined

Svelte 5 introduces **runes** — a new approach to reactivity that makes your component logic explicit and composable.

## What Are Runes?

Runes are special compiler hints. They look like function calls but are processed by the Svelte compiler at build time:

- `$state()` — reactive state
- `$derived()` — computed values
- `$effect()` — side effects
- `$props()` — component properties

## Declaring State

```svelte
<script>
  let count = $state(0)
</script>

<button onclick={() => count++}>
  Clicks: {count}
</button>
```

## Derived Values

```svelte
<script>
  let items = $state(['apple', 'banana', 'cherry'])
  // sorted is used in the template below
  const sorted = $derived([...items].sort())
</script>
<ul>
  {#each sorted as item}
    <li>{item}</li>
  {/each}
</ul>
```

## Component Props

```svelte
<script>
  const { name, age = 18 } = $props()
</script>

<p>{name} is {age} years old.</p>
```

## Summary

Runes bring explicit, fine-grained reactivity to Svelte. They're composable, testable, and work great in `.svelte.ts` files too — no longer confined to `.svelte` components.
