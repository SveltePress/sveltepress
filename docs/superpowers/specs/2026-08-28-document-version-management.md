# Framework-level document version management

## Problem Statement

SveltePress site authors can publish only one active documentation tree. Authors who need to support multiple product releases must assemble their own snapshot scripts, URL conventions, navigation, version selector, lifecycle notices, link rewriting, search isolation, and build-output rules. Those private solutions are easy to break and are not reusable across themes. SveltePress itself must provide a coherent version-management capability that freezes the current documentation, keeps the latest documentation on its existing URLs, serves historical documentation from stable URLs, and exposes a headless contract that any theme can render.

## Solution

SveltePress will provide framework-level document version management across a dedicated author-time CLI, the core Vite package, and the Default Theme.

Site authors initialize a machine-readable version manifest and use an atomic command to start a new current version. The command validates the site, snapshots the previous current content into real SvelteKit routes, freezes its resolved sidebar, updates the manifest, and leaves the original unprefixed routes as the new current documentation. The core package reads the manifest, validates version routes, exposes version context and path-resolution helpers through a virtual module, and keeps generated outputs separated by version. The Default Theme renders an accessible version selector, version-specific navigation, lifecycle banners, version-aware links, search behavior, and edit links. Sites without a manifest retain their current behavior.

## User Stories

1. As a SveltePress site author, I want to initialize version management with an explicit current version, so that my existing documentation can adopt the feature without changing its URLs.
2. As a site author, I want the current documentation to remain at unprefixed routes, so that existing links and search rankings do not break.
3. As a site author, I want to create a new current version with one command, so that the previous documentation is frozen consistently.
4. As a site author, I want version creation to be atomic, so that a failed command never leaves a partial snapshot or inconsistent manifest.
5. As a site author, I want the command to reject an existing version ID, so that a published snapshot cannot be overwritten accidentally.
6. As a site author, I want version IDs to support common labels such as `v8`, `8.1.0`, and `next-2026`, so that the framework does not force SemVer.
7. As a site author, I want a separate display label for each stable ID, so that URL design and user-facing naming can evolve independently.
8. As a site author, I want a configurable version route prefix, so that version routes fit my site's URL scheme.
9. As a site author, I want route-prefix collisions detected before initialization, so that SveltePress does not overwrite an existing page.
10. As a site author, I want complete route directories copied into a snapshot, so that colocated components and assets continue to work.
11. As a site author, I want root layouts and other site-level runtime files excluded from snapshots, so that historical routes inherit the live application shell safely.
12. As a site author, I want include and exclude patterns, so that documentation can coexist with non-versioned application routes.
13. As a site author, I want external content dependencies rejected unless declared shared, so that a snapshot does not silently change later.
14. As a site author, I want declared shared dependencies reported during validation, so that I understand which historical behavior remains live.
15. As a site author, I want the current resolved sidebar frozen with each snapshot, so that historical navigation matches historical content.
16. As a reader, I want a visible version selector on desktop and mobile, so that I can find documentation for the release I use.
17. As a keyboard or assistive-technology user, I want the selector to follow accessible menu-button behavior, so that version navigation does not depend on hover or a pointer.
18. As a reader, I want internal links to stay inside the version I am browsing, so that I do not unknowingly cross into current documentation.
19. As a reader, I want a version switch to preserve the logical page when it exists, so that I can compare the same topic across releases.
20. As a reader, I want a clear fallback when the target version lacks the current page, so that I enter the selected version without seeing unrelated content.
21. As a reader of a deprecated version, I want a prominent support-status notice, so that I can judge the risk of using old guidance.
22. As a reader of an EOL version, I want the documentation to remain accessible, so that I can maintain an older system.
23. As a site author, I want lifecycle states and messages to be explicit configuration, so that SveltePress does not infer support policy from time.
24. As a multilingual site author, I want all selector and lifecycle text to be localizable, so that version management fits my site's language.
25. As a custom-theme author, I want version data and path helpers without Default Theme UI, so that I can build my own presentation on the same framework behavior.
26. As a custom-theme author, I want one stable virtual-module contract, so that I do not need to parse SveltePress's manifest directly.
27. As a site author, I want search results isolated to the selected version, so that readers do not mix incompatible APIs.
28. As a site author, I want historical search disabled clearly when no historical index is configured, so that the site never falls back silently to current results.
29. As a crawler, I want each version page to have its own canonical URL, so that historical content is represented accurately.
30. As a site author, I want stable and deprecated versions in the sitemap while EOL versions default to noindex, so that discoverability follows support policy.
31. As an LLM consumer, I want one `llms.txt` per documentation version, so that current and historical guidance are not mixed.
32. As a PWA user, I want current documentation precached and historical documentation cached on demand, so that installation size does not multiply with every snapshot.
33. As a contributor, I want historical edit links to target the snapshot source, so that fixes do not accidentally modify current documentation.
34. As a maintainer, I want EOL edit links to be optionally disabled, so that unsupported branches do not invite changes.
35. As a maintainer, I want a list command, so that I can inspect the current and historical versions from automation or a terminal.
36. As a maintainer, I want a validation command, so that CI can detect malformed manifests, missing snapshots, orphan snapshots, conflicts, and unsafe dependencies.
37. As a maintainer, I want version commands to reject a dirty Git worktree by default, so that snapshots correspond to an identifiable source state.
38. As a maintainer, I want an explicit dirty-worktree override and support for non-Git projects, so that Git is a safety aid rather than a framework requirement.
39. As a monorepo maintainer, I want each site to own its manifest and snapshots, so that unrelated workspaces are never modified implicitly.
40. As an existing SveltePress user, I want no behavior or bundle changes without a valid version manifest, so that upgrading is backward compatible.
41. As a package maintainer, I want actionable validation errors with affected routes and files, so that failures can be corrected without reading implementation code.
42. As a release maintainer, I want the official documentation site to exercise the released feature, so that the first release proves the complete workflow against a real SveltePress site.

## Implementation Decisions

- A new `@sveltepress/cli` package owns author-time commands and filesystem mutation. The Vite and theme packages remain read-only consumers during development and builds.
- The public command group is `sveltepress versions`. Its initial commands are `init`, `create`, `list`, and `validate`. The initial release does not include overwrite, rename, or delete operations.
- `versions init --current <id>` creates the authority manifest after validating the current site and route-prefix availability. An optional label defaults to the ID.
- `versions create <new-current-id>` snapshots the manifest's prior current version, records that snapshot as `stable`, and updates the unprefixed working documentation to the new current ID in one transaction. An optional label defaults to the new ID.
- The authority manifest is a project-root `sveltepress.versions.json`. It has a published JSON Schema, runtime validation, and exported TypeScript types.
- The manifest records the immutable route base after the first snapshot, the current version, ordered historical versions, lifecycle state, optional lifecycle message, source reference, search metadata, content include/exclude rules, and explicitly shared paths.
- Version order in the manifest is authoritative. The current version renders first, and a newly frozen former current version is inserted at the start of the historical list.
- Version IDs use a safe lowercase route-segment grammar that permits letters, digits, dots, and hyphens while rejecting separators, traversal segments, whitespace, encoding ambiguity, and hosting-sensitive case differences.
- Historical snapshots are real SvelteKit routes under the configured base path and ID. The default base path is `/v`.
- The snapshot copies the complete selected route directories, including colocated components and assets. It excludes the root layout and site-level application files that should continue to be inherited.
- Before writing, the CLI analyzes route-local imports, code imports, static-root references, and shared-library references. A dependency outside the snapshot boundary is an error unless its path matches an explicit shared rule.
- The CLI stages all generated content and metadata outside the final target and commits them atomically only after validation succeeds. Existing targets are never overwritten.
- In a Git repository, version creation fails on a dirty worktree unless `--allow-dirty` is provided. The command works normally when no Git repository exists and never creates a Git commit automatically.
- A generated snapshot metadata file stores the route inventory and JSON-serializable resolved sidebar for that historical version. The top-level manifest remains the authority for version existence, order, status, and public metadata.
- The core Vite package automatically enables version behavior when it discovers a valid default manifest. The main plugin can override the manifest location or disable version management explicitly.
- A new core virtual module exposes the resolved version manifest, the version associated with the current route, the logical page path without a version prefix, route availability, and pure helpers for version-aware links and switches.
- The page/layout route matcher will support the approved version-ID grammar, including dots, without weakening its restriction to SvelteKit page and layout files.
- Internal document links are resolved at runtime from the active version context. External URLs, fragment-only links, downloads, and explicitly unversioned site routes remain unchanged.
- Switching versions targets the same logical route when present. If absent, it targets that version's home route and carries enough state for Default Theme to explain the fallback.
- Default Theme renders a click-operated, keyboard-accessible version selector in the desktop Navbar and mobile navigation drawer. It always displays the current version label.
- Default Theme consumes the frozen historical sidebar, prefixes its internal destinations, and preserves the current site-level Navbar.
- Default Theme displays localized status banners on every deprecated or EOL page. Banners include configurable text and a link to the equivalent current page or current home fallback.
- Default Theme extends its i18n contract with version-selector, missing-page, deprecated, and EOL strings while retaining English defaults.
- Search integrations receive the resolved version context. Each version can define an independent index or facet configuration. Historical search is visibly unavailable when no matching configuration exists.
- Each version page is self-canonical. Stable and deprecated versions participate in sitemap generation. EOL versions default to noindex and sitemap exclusion, with an explicit opt-in override.
- Current documentation retains `/llms.txt`; each historical version gets a separate file below its version root. Content is never combined across versions.
- Default PWA behavior precaches the current application and documentation only. Historical pages use runtime caching when PWA is enabled.
- Historical edit links resolve to the snapshot source and optional per-version source reference. EOL versions can disable edit links.
- Each workspace site owns its manifest and snapshots. The CLI operates only on its current working directory and leaves monorepo orchestration to workspace scripts.
- Sites without a valid manifest preserve existing plugin configuration, output, route behavior, theme UI, and PWA behavior.
- The official documentation site will act as the release acceptance fixture. Its use of the feature is a real consumer configuration, not a test-only code path.

## Testing Decisions

- Tests assert externally observable behavior rather than internal call structure. The preferred high seam is a temporary SveltePress site exercised through the public CLI and a production build, with focused pure-function tests only where failure cases are expensive to express end to end.
- CLI integration tests create temporary sites and exercise `init`, `create`, `list`, and `validate`. They verify files, manifest transitions, stdout/stderr, exit codes, dirty-worktree behavior, duplicate IDs, route conflicts, unsafe dependencies, shared dependencies, and rollback after injected failures.
- Core package tests load representative manifests and assert the virtual-module contract, route matching with dotted IDs, logical-path resolution, target availability, missing-page fallback, malformed-manifest build failure, and unchanged behavior without a manifest.
- Default Theme tests exercise the public rendered selector and status-banner behavior, keyboard interaction, mobile presence, version-aware links, frozen sidebars, localized strings, and edit-link resolution. Existing component and Markdown snapshot conventions are reused where they express public output.
- Search tests verify that selected-version metadata reaches adapters and that a historical version without search configuration never queries the current index.
- Build-output integration tests verify self-canonical version pages, sitemap lifecycle rules, separated `llms.txt` files, and PWA exclusion of historical HTML from precache.
- Documentation checks must distinguish active routes from historical snapshots so that old wording is not validated as current content. Language parity checks apply within each site and do not implicitly couple separate workspace sites.
- The official English documentation site is initialized and used to create a real historical snapshot during the release validation. The built site must serve current and historical routes, switch versions, preserve/fallback logical paths, render lifecycle state, and produce isolated machine-readable outputs.
- Package-level tests and typechecks run after each ticket. The root lint, full test suite, all documentation checks, all affected builds, and Changeset status run before release.
- A final code review checks both repository standards and this specification. Findings are resolved before commit and push.

## Out of Scope

- Automatic deployment, hosting-provider configuration, DNS, or per-version domains.
- Automatic batch management of sibling workspaces or multilingual sites.
- Overwriting, renaming, deleting, or restoring historical snapshots through the CLI.
- Inferring lifecycle status from dates or package registries.
- Automatically committing or tagging Git history.
- Recursively vendoring arbitrary application code or secrets referenced outside configured documentation content.
- Migrating an existing published version base path after the first snapshot.
- Guaranteeing that explicitly shared files remain historically immutable.

## Further Notes

- The repository currently has independent package versions and an established Changesets release workflow. Documentation version IDs are product/site identifiers and are intentionally independent of npm package versions.
- The current route matcher, auto-sidebar behavior, LLMs generator, PWA glob, edit-link resolver, and documentation checks all assume one active route tree. Implementation must update those seams deliberately rather than relying on copied files alone.
- The current theme option shapes are JSON-serializable for normal Navbar/sidebar links, but snapshot creation must reject or clearly report any resolved value that cannot be represented safely.
- The first release is also the complete acceptance run: development success alone is insufficient without a real manifest, real snapshot, production build, ordinary Changeset delivery, and observable release result.

