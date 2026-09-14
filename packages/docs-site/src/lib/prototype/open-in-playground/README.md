# Open in Playground leaf placement (throwaway)

Four structurally different placements of **Open in Playground** on real Default Theme chrome. Answers [Where does Open in Playground sit on an Entry leaf?](https://github.com/SveltePress/sveltepress/issues/460). Dev-only; the control does not navigate.

## Run

```bash
cd packages/docs-site
pnpm dev
```

Then:

- Guide Entry: http://localhost:5556/guide/markdown/basic-writing/?variant=A
- Reference Entry: http://localhost:5556/reference/vite-plugin/?variant=A
- Not an Entry (control hidden): http://localhost:5556/guide/quick-start/?variant=A

`←` / `→` or the bottom bar cycle variants. Site theme toggle is light/dark. Resize below 950px for the `sm` breakpoint.

## Variants

| Key | Name | Structure |
|---|---|---|
| A | Beside the title | Quiet text button on the `h1` row |
| B | Article header strip | Crumb + chip in a subnav/header bar |
| C | After the intro | Primary callout after the lead, before the first heading / Live code |
| D | TOC column / mobile dock | Desktop: above On this page. Below 950px: floating dock |

Custom theme has no Guide leaf, so it is not in this prototype.
