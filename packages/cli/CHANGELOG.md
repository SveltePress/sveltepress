# @sveltepress/cli

## 0.3.0

### Minor Changes

- [`38c2225`](https://github.com/Blackman99/sveltepress/commit/38c2225ddc00882146324d3eba5d0c1e298e85b8) Thanks [@Blackman99](https://github.com/Blackman99)! - Add content-addressed incremental document version builds. Historical releases are stored as immutable source deltas and reusable page artifacts, while the stable SveltePress shell composes current and historical routes without recompiling unchanged pages.

### Patch Changes

- [`77f2d01`](https://github.com/Blackman99/sveltepress/commit/77f2d01b3492bfc334a6b117dcb79dc87e420813) Thanks [@Blackman99](https://github.com/Blackman99)! - Embed generated LiveCode modules in reusable page artifacts so incremental version builds can restore pages without a separate live-code cache.

- Updated dependencies [[`098f952`](https://github.com/Blackman99/sveltepress/commit/098f9527d0dd1af101be8030be684df16765b387), [`b103daa`](https://github.com/Blackman99/sveltepress/commit/b103daa1b560eb9a8a731bd3b47b404bbece4bee), [`37c4784`](https://github.com/Blackman99/sveltepress/commit/37c4784116cbac743a304296947ac0bdc561be4b), [`77f2d01`](https://github.com/Blackman99/sveltepress/commit/77f2d01b3492bfc334a6b117dcb79dc87e420813), [`38c2225`](https://github.com/Blackman99/sveltepress/commit/38c2225ddc00882146324d3eba5d0c1e298e85b8), [`89eb53b`](https://github.com/Blackman99/sveltepress/commit/89eb53ba387ac2907df7ee08871ae06e5cfdb798), [`54c9a77`](https://github.com/Blackman99/sveltepress/commit/54c9a77afe645a06ce65170c7aade3d53094b8a7)]:
  - @sveltepress/vite@1.7.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`90c8178`](https://github.com/Blackman99/sveltepress/commit/90c8178a3c2bc56abd5ca0cf707f343717290cbf)]:
  - @sveltepress/vite@1.6.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`4136508`](https://github.com/Blackman99/sveltepress/commit/413650848152edacb3b8192422c8ec46c36d167e)]:
  - @sveltepress/vite@1.6.1

## 0.2.0

### Minor Changes

- [`134f459`](https://github.com/Blackman99/sveltepress/commit/134f459af671a3d442eea498309b040843ca8f01) Thanks [@Blackman99](https://github.com/Blackman99)! - Add build-time documentation change catalogs, frozen historical change metadata, strict `:::since` markers, current-version badges, and the `VersionChanges` overview component.

### Patch Changes

- Updated dependencies [[`134f459`](https://github.com/Blackman99/sveltepress/commit/134f459af671a3d442eea498309b040843ca8f01)]:
  - @sveltepress/vite@1.6.0

## 0.1.0

### Minor Changes

- [`40901e2`](https://github.com/Blackman99/sveltepress/commit/40901e2be134ff2177de19f2ee86286ea8f41b02) Thanks [@Blackman99](https://github.com/Blackman99)! - Add framework-level document version management with atomic CLI snapshots, manifest validation, version-aware routes and outputs, frozen historical navigation, lifecycle UI, isolated search, canonical metadata, and PWA caching boundaries.

### Patch Changes

- Updated dependencies [[`df237f9`](https://github.com/Blackman99/sveltepress/commit/df237f9a2e14d93e86d161da7b9889260da7a2fa), [`ff0f7b0`](https://github.com/Blackman99/sveltepress/commit/ff0f7b0ba842011b61ecdb557e440430faffa6e8), [`aeff447`](https://github.com/Blackman99/sveltepress/commit/aeff447e94204e29ad41c43bf06bcbcd69634008), [`75a3083`](https://github.com/Blackman99/sveltepress/commit/75a3083a36724eccc5e69649299d9fb3d66bd124), [`a628b2b`](https://github.com/Blackman99/sveltepress/commit/a628b2b133ab23642b30b49c7f60e725ff5eda58), [`c0f6f68`](https://github.com/Blackman99/sveltepress/commit/c0f6f68300114b2fe76d979db59dd103e04b388e), [`056c49e`](https://github.com/Blackman99/sveltepress/commit/056c49eb3b7a56d323e281222062e8c58d72e7f5), [`fd99609`](https://github.com/Blackman99/sveltepress/commit/fd99609a500503590f440060e06705cc088e914e), [`09f2b11`](https://github.com/Blackman99/sveltepress/commit/09f2b11aa8aecfab4ef5d374836f07d9d19b2cc7), [`40901e2`](https://github.com/Blackman99/sveltepress/commit/40901e2be134ff2177de19f2ee86286ea8f41b02)]:
  - @sveltepress/vite@1.5.0
