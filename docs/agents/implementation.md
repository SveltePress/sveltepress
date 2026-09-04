# Implementation contract

Use this checklist on every implementation change. Compatibility, documentation locales, and documentation versions are part of done — not follow-ups.

The official docs live in one merged site: `packages/docs-site`. English is `/`, Chinese is `/zh/`, Bengali is `/bn/`. There are no separate `docs-site-zh` or `docs-site-bn` packages.

## 1. Compatibility with existing chrome

Functional UI, layout, styling, or interaction changes must keep working with features already in the Default Theme and docs site.

- **Responsive.** Check desktop and a viewport below the theme `sm` breakpoint (`950px`). Navbar, sidebar, language switcher, version selector, home, and article layout must remain usable.
- **Light and dark.** Check both color modes. New surfaces must use existing theme tokens (`svp-primary`, zinc/black-white overlays, `themeColor`), not hard-coded light-only colors.
- **Locales and versions.** Language switching, per-locale sidebars, historical `/v/<id>/` and `/<locale>/v/<id>/` routes, lifecycle banners, and search gates must still behave after the change.

Done when the changed flow works on desktop and mobile, in light and dark, and on at least one localized current page and one historical page when the change touches shared chrome.

## 2. Documentation locales

If the change is user-facing (API, config, CLI, theme behavior, or author workflow), update the docs in the same change.

Update **every configured locale** together:

| Locale | Content root |
| --- | --- |
| English `/` | `packages/docs-site/src/routes/` |
| Chinese `/zh/` | `packages/docs-site/src/routes/zh/` |
| Bengali `/bn/` | `packages/docs-site/src/routes/bn/` |

Keep the same logical paths, `:::since` ids, and config examples across locales. Navbar, sidebar, home actions, and feature cards stay on logical links (`/guide/introduction/`). Put per-locale chrome in that locale’s `theme` (`config/locales.ts`, `config/zh/*`, `config/bn/*`).

Do not ship English-only documentation updates.

Done when each locale’s matching `+page.md` (and any reference page) describes the same contract, and `pnpm check:docs:content` passes.

## 3. Documentation versions × locales

Current docs stay on existing URLs. Historical docs are frozen snapshots. Versioning and i18n compose: each locale has its own manifest and base path.

| Locale | Manifest | Version base | Deltas |
| --- | --- | --- | --- |
| `/` | `sveltepress.versions.json` | `/v` | `version-deltas/` |
| `/zh/` | `sveltepress.versions.zh.json` | `/zh/v` | `version-deltas-zh/` |
| `/bn/` | `sveltepress.versions.bn.json` | `/bn/v` | `version-deltas-bn/` |

Decide whether the docs site needs a **new frozen version**:

- **Yes** when the official site should snapshot this release (user-visible feature freeze, What’s New, historical URLs). Then freeze **every** locale with the same version id.
- **No** when you are only editing current docs (typos, clarifications, in-progress features not yet frozen). Still add `:::since` on current pages when the feature is version-aware.

When freezing, cover the full locale × version grid. Do not freeze English only.

```sh
pnpm exec sveltepress versions create <id> --label "<id>"
pnpm exec sveltepress versions create <id> --label "<id>" --locale zh
pnpm exec sveltepress versions create <id> --label "<id>" --locale bn
```

Include all content the freeze needs:

- Translated pages and `:::since` markers in every locale
- Per-locale navbar, sidebar, and `i18n` copy
- Precompiled assets used on those pages (`preBuildIconifyIcons`, Pagefind, version artifacts)
- A default `sveltepress versions build` so `/v/`, `/zh/v/`, and `/bn/v/` all compose

Done when each locale’s current and historical trees exist for that id, current-only pages keep their locale prefix, and `pnpm check:docs` plus `pnpm check:versioning-build` pass.
