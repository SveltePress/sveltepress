---
description: Guides fixing a Sveltepress GitHub issue end-to-end: reproducing the bug, writing a failing test, implementing the fix, running tests/lint, creating a changeset, and committing. Use when the user wants to fix a bug, investigate an issue, or submit a bug fix.
argument-hint: "[issue-number]"
---

# Issue Fix Skill

This skill guides Claude through the full workflow of reproducing, fixing, and submitting a bug fix for a Sveltepress GitHub issue.

## Workflow

### 1. Understand the Issue

- Fetch the issue from GitHub using `gh issue view <number>` or review the user-provided description.
- Identify:
  - Which package is affected (`vite`, `theme-default`, `twoslash`, `create`)
  - Steps to reproduce
  - Expected vs. actual behavior

### 2. Locate the Relevant Code

- Find the affected files in the appropriate package under `packages/`.
- Read existing tests in `packages/<package>/__tests__/` to understand expected behavior.
- Check snapshot files in `__tests__/__snapshots__/` for context on current output.

### 3. Write a Failing Test

Before fixing, write a test that reproduces the bug:

```bash
# Tests live in:
packages/vite/__tests__/
packages/theme-default/__tests__/
```

Test files use the pattern `*.test.ts` with Vitest. Run the test to confirm it fails:

```bash
# Run a single package's tests
cd packages/theme-default && npx vitest run
cd packages/vite && npx vitest run

# Run all tests from root
pnpm test
```

### 4. Implement the Fix

- Make the minimal change needed to fix the bug.
- Follow naming conventions:
  - Svelte components: `PascalCase`
  - JS/TS files: `kebab-case`
  - Functions/variables: `camelCase`
- Do not refactor unrelated code or add unnecessary abstractions.

### 5. Verify the Fix

```bash
# Run tests for affected package
pnpm test:vite           # for packages/vite
pnpm test:theme-default  # for packages/theme-default

# Run all tests
pnpm test

# Lint and format checks
pnpm lint
pnpm format
```

If snapshot tests fail due to intentional output changes, update them:

```bash
cd packages/<package> && npx vitest run --update-snapshots
```

### 6. Create a Changeset

For user-facing bug fixes, create a changeset:

```bash
pnpm changeset
```

- Select the affected package(s)
- Choose `patch` for bug fixes
- Write a clear, user-focused summary (e.g., "Fix sidebar not highlighting active page on nested routes")

### 7. Commit

Stage and commit changes with a conventional commit message:

```bash
git add <specific files>
git commit -m "fix(<package>): <short description of fix>"
```

Commit the changeset file alongside the fix.

## Package Reference

| Package | Path | Test command |
|---|---|---|
| `@sveltepress/vite` | `packages/vite/` | `pnpm test:vite` |
| `@sveltepress/theme-default` | `packages/theme-default/` | `pnpm test:theme-default` |
| `@sveltepress/twoslash` | `packages/twoslash/` | `cd packages/twoslash && npx vitest run` |
| `@sveltepress/create` | `packages/create/` | manual |

## Key Directories

- **Markdown processors**: `packages/theme-default/src/markdown/`
- **Svelte components**: `packages/theme-default/src/components/`
- **Vite plugins**: `packages/vite/src/`, `packages/theme-default/src/vite-plugins/`
- **Tests**: `packages/<package>/__tests__/`
- **Snapshots**: `packages/<package>/__tests__/__snapshots__/`

## Tips

- Read snapshot tests — they show exactly what the processor outputs and are the fastest way to understand expected behavior.
- When fixing markdown processors, look for existing tests in `__tests__/` that cover adjacent functionality.
- Multiple packages may need changes for a single fix (e.g., a feature used by both `vite` and `theme-default`).
- Always run `pnpm lint` before committing — the project enforces lint via pre-commit hooks (Husky + lint-staged).
- If the issue involves a Svelte component change, note that there are no automated component tests — manual verification via `cd packages/docs-site && pnpm dev` may be needed.
