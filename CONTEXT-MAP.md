# SveltePress Context Map

SveltePress is a pnpm monorepo for a content-centered site build tool built on SvelteKit. Use the package descriptions in [`CLAUDE.md`](./CLAUDE.md) as the current domain vocabulary and package ownership map.

## Contexts

- Core build and Markdown routing: `packages/vite`
- Default documentation theme: `packages/theme-default`
- Project scaffolding: `packages/create`
- Blog theme: `packages/theme-blog`
- Search integrations: `packages/docsearch` and `packages/meilisearch`
- English, Chinese, and Bengali documentation: `packages/docs-site` (`/`, `/zh/`, `/bn/`)
- Cross-package release management: `.changeset` and `.github/workflows/publish-npm.yml`

Record durable architectural decisions under `docs/adr/`. Keep package-specific implementation details with the owning package and link them from an ADR only when the decision crosses package boundaries.

