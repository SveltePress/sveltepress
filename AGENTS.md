# SveltePress Agent Instructions

Follow the project overview, package map, development workflow, and code conventions in [`CLAUDE.md`](./CLAUDE.md).

For implementation work, preserve the pnpm workspace boundaries, add behavior-focused Vitest coverage, update all affected documentation locales, and add an accurate Changeset for user-facing package changes.

## Implementation contract

Before finishing implementation work:

1. **Compatibility.** Functional UI changes must keep working with existing chrome: responsive layout (including the theme `sm` breakpoint at 950px) and light/dark theme.
2. **Documentation languages.** If docs need updating, update every configured locale in `packages/docs-site` (`/`, `/zh/`, `/bn/`) in the same change. Do not ship English-only docs.
3. **Documentation versions.** If the docs site needs a new frozen version, follow the existing versions CLI for **every** locale. Versioning and i18n compose (`/v`, `/zh/v`, `/bn/v`); do not freeze only one language or omit precompiled assets.

Details: [`docs/agents/implementation.md`](./docs/agents/implementation.md)

## Agent skills

- Issue tracker conventions: [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md)
- Triage label vocabulary: [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md)
- Domain documentation locations: [`docs/agents/domain.md`](./docs/agents/domain.md)
- Implementation contract: [`docs/agents/implementation.md`](./docs/agents/implementation.md)

