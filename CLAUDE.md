# Sveltepress - AI Assistant Guide

This document provides context and guidance for AI assistants (like Claude) working on the Sveltepress codebase.

## Project Overview

**Sveltepress** is a content-centered site build tool inspired by [Vitepress](https://vitepress.vuejs.org/) and built with [SvelteKit](https://kit.svelte.dev/). It's designed for creating documentation sites with excellent performance and developer experience.

- **Website**: https://sveltepress.site/
- **Repository**: https://github.com/SveltePress/sveltepress
- **Package Manager**: pnpm (v10.30.2)
- **Node Version**: >16

## Monorepo Structure

This is a pnpm monorepo workspace containing multiple packages:

### Core Packages

- **`packages/create/`** - CLI tool for scaffolding new Sveltepress projects
  - Provides both JS and TS templates (`template-js/`, `template-ts/`)
  - Entry point: `src/index.ts`

- **`packages/vite/`** - Vite plugin and core build functionality
  - Contains Vite plugins and build configurations
  - Tests in `__tests__/`

- **`packages/theme-default/`** - Default theme for Sveltepress
  - Svelte components, styling, and markdown processing
  - Includes Twoslash integration for TypeScript code examples
  - Tests in `__tests__/`
  - Key directories:
    - `src/components/` - Reusable Svelte components
    - `src/markdown/` - Markdown processing and transformations
    - `src/vite-plugins/` - Theme-specific Vite plugins

- **`packages/twoslash/`** - TypeScript Twoslash integration
  - Provides TypeScript hover information in code blocks

### Documentation Sites

- **`packages/docs-site/`** - Main English documentation
- **`packages/docs-site-zh/`** - Chinese (中文) documentation
- **`packages/docs-site-bn/`** - Bengali documentation

Each docs site includes:
- `config/` - Navigation, sidebar, PWA, and search configurations
- `src/routes/` - SvelteKit routes and markdown content
- `static/` - Static assets (manifests, robots.txt)

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test
pnpm test:vite
pnpm test:theme-default

# Lint code
pnpm lint

# Format check
pnpm format
```

### Working on Documentation

```bash
cd packages/docs-site
# Then run SvelteKit dev server (check package.json for scripts)
```

### Testing

- **Test Framework**: [Vitest](https://vitest.dev/)
- **Test Location**: `packages/[package-name]/__tests__/`
- **Running Tests**: 
  - All tests: `pnpm test` (from root)
  - Package-specific: `cd packages/[package] && npx vitest run`

Test files follow the pattern `*.test.ts` and often include snapshot tests (`__snapshots__/`).

## Key Technologies

- **SvelteKit**: Framework for building the sites
- **Svelte**: Component framework
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **TypeScript**: Type safety
- **UnoCSS**: Utility-first CSS framework
- **Twoslash**: TypeScript code annotation

## Code Style & Conventions

- **Linter**: ESLint with `@antfu/eslint-config`
- **Formatter**: Prettier with `prettier-plugin-svelte`
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Changesets**: For versioning and changelogs

Configuration files:
- `eslint.config.mjs` - ESLint configuration
- `lint-staged.config.mjs` - Lint-staged rules
- `vitest.config.ts` - Vitest configuration

## Important Features

### Markdown Processing

The `theme-default` package includes extensive markdown processing capabilities:
- **Admonitions**: Callout boxes for notes, warnings, etc.
- **Code Imports**: Import code from external files
- **Line Highlighting**: Highlight specific lines in code blocks
- **Live Code**: Interactive Svelte component examples
- **Twoslash**: TypeScript hover information
- **Anchors**: Automatic heading anchors
- **Links**: Enhanced link processing

Tests for these features are in `packages/theme-default/__tests__/`.

### Vite Plugins

Custom Vite plugins are located in:
- `packages/theme-default/src/vite-plugins/`
- `packages/vite/src/`

These handle markdown transformations, component resolution, and build optimizations.

## Common Tasks

### Adding a New Feature

1. Determine which package the feature belongs to
2. Create tests in `__tests__/`
3. Implement the feature
4. Update documentation in the appropriate `docs-site`
5. Run tests to ensure nothing breaks
6. Create a changeset if it's a user-facing change

### Fixing a Bug

1. Find the relevant package
2. Write a failing test that reproduces the bug
3. Fix the bug
4. Ensure the test passes
5. Check for related edge cases

### Updating Dependencies

The project uses a `catalog:` system in package.json for dependency management. Check `pnpm-workspace.yaml` and individual package.json files.

```bash
# Use taze for dependency updates (configured in taze.config.js)
```

## Release Process

- Uses **Changesets** for version management
- Run `pnpm release` to publish packages
- Changelogs use `@changesets/changelog-github`
- Tool: `changelogithub` for enhanced GitHub changelogs

## File Structure Conventions

- **Build configs**: `build.config.ts`, `vite.config.ts`, `vitest.config.ts`
- **Type definitions**: `types.d.ts`, `app.d.ts`
- **Svelte config**: `svelte.config.js`
- **TypeScript config**: `tsconfig.json`

## Resources

- **Main Docs**: https://sveltepress.site/
- **Contributing Guide**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Quick Start**: https://sveltepress.site/guide/quick-start/
- **GitHub Issues**: https://github.com/SveltePress/sveltepress/issues

## Tips for AI Assistants

1. **Always run tests** after making changes to ensure nothing breaks
2. **Check existing tests** in `__tests__/` folders to understand expected behavior
3. **Follow the monorepo structure** - changes often affect multiple packages
4. **Read snapshot tests** - they provide excellent examples of expected outputs
5. **Markdown processing** is a core feature - be careful when modifying transformations
6. **Multiple doc sites** exist - consider whether changes need to be reflected across all language versions
7. **Type safety matters** - this project uses TypeScript throughout
8. **Performance is important** - Sveltepress aims for excellent Lighthouse scores

## Getting Help

- Review the [Contributing Guide](./CONTRIBUTING.md)
- Check the [online documentation](https://sveltepress.site/)
- Look at existing tests for usage examples
- Open an issue for questions or clarifications
