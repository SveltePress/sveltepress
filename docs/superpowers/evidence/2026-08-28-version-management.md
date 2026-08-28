# Document version management release evidence

The official English documentation site was used as the real acceptance fixture. It serves `2026-08-28` at the normal routes and the CLI-created `2026-08-27` snapshot below `/v/2026-08-27/`.

## Before and after

Both images show the official Quick Start page at 1280 × 720. The before image was built from the fixed pre-feature baseline commit `a7993b9a`; the after image was built from the release candidate. The after Navbar adds the current documentation version selector while preserving the page, search, navigation, sidebar, and table-of-contents layout.

### Before

![Quick Start before document version management](./version-management-before.png)

### After

![Quick Start after document version management](./version-management-after.png)

## Desktop

The historical fallback page shows the selected version, deprecated lifecycle state, current-version recovery link, search isolation, and missing-page explanation.

![Desktop historical version selector and lifecycle state](./version-management-desktop.png)

## Mobile

The mobile navigation drawer exposes the same version selector and lifecycle label.

![Mobile historical version selector](./version-management-mobile.png)

The no-manifest compatibility path was exercised by production builds and Svelte checks for the Chinese and Bengali documentation sites; neither site renders version UI without a manifest.

## Current-version change discovery

The before images capture the public site before this release candidate: `/whats-new/` returns 404 and the version-management page has no current-version badge. The after images capture the locally built release candidate at the same routes.

### What's New route before

![What's New route before current-version change discovery](./version-changes-before.png)

### What's New route after

![What's New overview with new and updated page groups](./version-changes-after.png)

### Page badge before

![Version-management page before the current-version badge](./version-changes-badge-before.png)

### Page badge after

![Version-management page showing its current-version badge](./version-changes-badge-after.png)
