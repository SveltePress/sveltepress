# Playground chrome prototype (throwaway)

Answers [How should the Feature directory and embed chrome look?](https://github.com/SveltePress/sveltepress/issues/456).

Not the production `/playground/` tree. Do not merge to `main`.

## Run

```bash
pnpm prototype:playground
```

Then open:

- Home: http://localhost:5556/prototype/playground/
- Entry: http://localhost:5556/prototype/playground/default-theme/navbar/
- Failed boot: add `?boot=failed`
- Loading: add `?boot=loading`

`←` / `→` or the bottom bar cycles variants. Query `?variant=A|B|C` is shareable.

## Variants

- **A — Index strip.** Catalog is a grouped list. Entry chrome is a compact strip *above* a full-width Hosted editor. Stacked below 950px.
- **B — Directory rail.** Catalog is a table with a group rail. Entry keeps a persistent Feature directory rail (desktop) beside the editor; below 950px the rail drops and Switch Entry remains.
- **C — Stage dock.** Catalog is horizontal group reels. Entry makes the Hosted editor the stage; thin-index chrome docks *below* on desktop and *above* below 950px (stacked, strip first).
