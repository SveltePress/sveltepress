---
title: PWA
---

## Introduction

This feature integrated [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin)

Pass `pwa` option to theme default to use pwa. The options are exactly the same as [SvelteKit PWA Plugin Options](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin-options) except for `darkManifest`, which is the manifest path that would used for dark theme

:::note[package required]
If you want to enable pwa.  
You will need to add `workbox-window` as a dev dependency to your Vite project.
:::


## Example config

Take the config this site use for example:

@code(/config/pwa.ts)