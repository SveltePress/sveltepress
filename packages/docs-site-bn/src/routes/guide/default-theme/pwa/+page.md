---
title: PWA
---

## পরিচিতি

এই ফিচারটি [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin) থেকে নেয়া। 

থিম ডিফল্টে `pwa` পাঠিয়ে দিয়ে pwa ব্যবহার করা যাবে। অপশঙ্গুলো হুবহু [SvelteKit PWA Plugin Options](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin-options) এর মতই, শুধু `darkManifest` বাদে, যা হচ্ছে ডার্ক থিমে ব্যবহারের জন্য manifest path 

এবং svelte.config.js -এ `files.serviceWorker` কনফিগ করতে হবে, `SERVICE_WORKER_PATH` ব্যবহার করুন যা `@sveltepress/theme-default` থেকে এক্সপোর্ট করা হয়। 

```ts title="svelte.config.js"
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-static'

import { SERVICE_WORKER_PATH } from '@sveltepress/theme-default' // [svp! ++]

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    files: { // [svp! ++]
      serviceWorker: SERVICE_WORKER_PATH, // [svp! ++]
    }, // [svp! ++]
  },
}

export default config
```

:::note[প্যাকেজ আবশ্যক]{icon=noto:package}
যদি আপনি pwa চালু করতে চান। 
আপনার Vite project এ dev dependency হিসেবে `workbox-window` যুক্ত করতে হবে
:::


## কনফিগের উদাহরণ

এই সাইটের কনফিগ উদাহরণ হিসেবে দেখুন:

@code(/config/pwa.ts)