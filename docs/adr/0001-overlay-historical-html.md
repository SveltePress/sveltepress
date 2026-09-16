# ADR 0001: Overlay historical HTML instead of prerendering locale × version routes

## Status

Accepted

## Context

A SveltePress site that combines locales and document versions composes a cartesian product of URLs (`/`, `/zh/`, `/bn/` × current trees × each frozen `/v/<id>/`). Page **content** is already incremental (content-addressed modules under `.sveltepress/version-artifacts`). Production compose still mounted every historical shell under `src/routes` and asked adapter-static to prerender the whole graph. Artifact cache could not skip that cost. Official docs CI spent most of an 8-minute deploy in `sveltepress versions build`.

Per-version frozen `_app` sub-sites would isolate assets but change the “one site + version selector” UX. Keeping historical routes in the SvelteKit graph and copying unchanged HTML still required adapter-static to walk the full route set.

## Decision

`sveltepress versions build` runs Vite on **current** locale trees only. Frozen history is written into `dist` afterwards as overlay HTML that:

- rewrites canonical URLs, version labels, and lifecycle chrome
- injects compiled body HTML extracted from stored page-artifact `server.js` modules
- rewrites What’s New from the frozen `changes` object
- shares the current build’s `/_app/immutable` assets
- is excluded from the current-site Pagefind index (historical Pagefind stays copied from version-deltas)

Dev continues to mount historical shells so `/v/<id>/` works under `vite dev`.

## Consequences

- Production Vite time scales with current pages, not with locales × frozen versions.
- Historical pages are static overlays (SvelteKit `kit.start` is neutralized). Dropdowns that need client JS fall back to full-page links already present in the HTML.
- Overlay HTML must stay in sync with current hashed assets; a shell/asset change rewrites overlay, it does not remount history into Vite.
- CI cache of page artifacts remains useful; it is not a substitute for overlay.
