---
'@sveltepress/cli': patch
---

The versions manifest schema now accepts a `basePath` with more than one segment, such as `/zh/v`. That is the base path `versions init --locale` writes and the build accepts, but the schema rejected it, so editors reported an error in every per-locale manifest.
