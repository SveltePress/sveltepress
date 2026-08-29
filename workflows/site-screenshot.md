# Refresh the README site screenshot

## Purpose and owner

Maintain a current, reproducible screenshot of the Sveltepress home page in the root README. Sveltepress maintainers own the workflow and the final visual approval.

## Trigger

Run the workflow manually when a homepage change affects the header, hero, feature cards, theme styling, or responsive layout. It may also be run before a documentation release to confirm that the committed image is current.

## Required inputs and access

- A reachable Sveltepress home page URL. The default is `https://sveltepress.site/`; use `--url http://localhost:<port>/` to capture an unreleased local preview.
- Repository dependencies installed with `pnpm install`.
- A Playwright Chromium browser installed with `pnpm exec playwright install chromium`, or a local Chromium-compatible executable supplied with `--browser-path`.
- No account, cookies, credentials, or authenticated browser profile are required.

## Ordered actions

1. If capturing unreleased work, start the docs site or preview build and note its URL.
2. Run `pnpm capture:site-screenshot` with the default production URL, or pass `--url` for a local preview.
3. The command opens four fresh browser contexts: desktop light, desktop dark, mobile light, and mobile dark.
4. Each context receives its theme preference before navigation. The command disables CSS animations, hides scrollbars, waits for the hero, fonts, and visible images, then advances SVG animation timelines to 3 seconds and pauses them.
5. The command combines the four captures with the fixed desktop and mobile circular masks, writes a temporary PNG, validates `2048 × 1102`, and atomically replaces `assets/site.png`.
6. Inspect `assets/site.png` at full size. Confirm the header, hero, feature cards, mobile overlay, and both circular theme boundaries are visually correct.
7. Review `git diff --stat -- assets/site.png` and commit the image only after the visual checkpoint passes.

Useful options:

```bash
pnpm capture:site-screenshot -- --url http://localhost:5173/
pnpm capture:site-screenshot -- --output /tmp/site.png
pnpm capture:site-screenshot -- --browser-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

## Human checkpoint

The maintainer decides whether the generated image accurately represents the intended homepage state. Do not commit or publish the image when content is clipped, fonts are missing, images are blank, a focus outline is visible, or the theme circles no longer produce a useful composition.

## Outputs and observability

- Primary artifact: `assets/site.png` unless `--output` overrides it.
- Success output reports the source URL, final dimensions, byte size, and SHA-256 digest.
- A successful run exits with status `0`; validation or browser failures exit non-zero without replacing the prior artifact.

## Idempotency and retries

The workflow is idempotent for a stable page: every run uses isolated browser state and the same layout constants. Re-run after transient network or font-loading failures. Do not hand-edit the generated image between retries.

## Failure and escalation

- Browser missing: run `pnpm exec playwright install chromium` or pass `--browser-path`.
- Page or hero unavailable: verify the URL and use `--ready-selector` if the homepage landmark intentionally changed.
- Font or image timeout: fix the page/resource failure or increase `--timeout`; do not accept a partially loaded capture.
- Layout no longer fits: stop and update the documented viewport, placement, or circle constants together with the script and its tests. Treat this as an intentional workflow revision, not a one-off manual crop.

## Privacy and credentials

Capture only public or explicitly local preview URLs. The workflow creates fresh browser contexts and must not load a personal browser profile, cookies, credentials, or private URLs into a README artifact.

## Acceptance criteria

- One documented command regenerates the screenshot without manual image editing.
- Light and dark desktop/mobile renders use isolated, explicit theme state.
- The output is an RGBA PNG exactly `2048 × 1102`.
- Failure before validation leaves the existing target unchanged.
- Unit tests cover argument parsing, layout invariants, and PNG dimension validation.
- A real production or local-preview run passes automated validation and the human visual checkpoint.
