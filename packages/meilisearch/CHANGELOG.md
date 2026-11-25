# @sveltepress/meilisearch

## 0.0.3

### Patch Changes

- [`eaa5fcc`](https://github.com/SveltePress/sveltepress/commit/eaa5fcc3cd7c21494afe66a30d0e4c28e5e82275) Thanks [@Blackman99](https://github.com/Blackman99)! - Search results are now escaped before they are rendered. The component asked Meilisearch to wrap matches in `<mark>` and rendered the reply as HTML, so any markup stored in an indexed document reached the page. The component now asks for match markers that cannot be mistaken for markup, escapes the reply, and turns only those markers into `<mark>`. A result whose URL has a scheme other than http(s), such as `javascript:`, no longer navigates. Results from an index whose primary key is not called `id` now render: they all shared one list key before, which Svelte rejects.

## 0.0.2

### Patch Changes

- [`a7993b9`](https://github.com/Blackman99/sveltepress/commit/a7993b9a8e9186c28ed457f442b83626a18e978c) Thanks [@Blackman99](https://github.com/Blackman99)! - Document the supported default-theme Meilisearch integration, including the wrapper setup, index requirements, and the known static production bundling caveat.
