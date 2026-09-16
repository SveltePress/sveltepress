---
title: PWA
---

## পরিচিতি

এই ফিচারটি [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin) থেকে নেয়া।

থিম ডিফল্টে `pwa` পাঠিয়ে দিয়ে pwa ব্যবহার করা যাবে। অপশঙ্গুলো হুবহু [SvelteKit PWA Plugin Options](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin-options) এর মতই, শুধু `darkManifest` বাদে, যা হচ্ছে ডার্ক থিমে ব্যবহারের জন্য manifest path

এবং svelte.config.js -এ `files.serviceWorker` কনফিগ করতে হবে, `SERVICE_WORKER_PATH` ব্যবহার করুন যা `@sveltepress/theme-default` থেকে এক্সপোর্ট করা হয়।

```ts title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

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

## Precache (versions & i18n)

ডিফল্টভাবে Sveltepress শুধু **app shell** এবং **homepage HTML** precache করে। Shell হলো SvelteKit-এর entry মডিউল, hashed CSS / fonts, এবং root icon — প্রতি-রুট `_app/immutable/nodes` বা shared chunk নয়। বাকি ডকুমেন্টেশন পেজ এবং সেই hashed মডিউল ইউজার ভিজিট করলে runtime-এ cache হয় (পেজ: `NetworkFirst`, সর্বোচ্চ 50টি এন্ট্রি; hashed client ফাইল: `CacheFirst`, সর্বোচ্চ 400টি / 30 দিন)। ছবি এবং SvelteKit `__data.json`ও runtime cache হয়।

অনেক পেজ, version এবং locale থাকলে এটি service worker install/update দ্রুত রাখে, তাই deploy-এর পর refresh prompt তাড়াতাড়ি দেখা যায়। সব prerendered HTML বা সব client মডিউল precache করলে Workbox প্রতিবার `versions × locales × pages` hash, compare এবং download করে।

প্রথম install-এ homepage hydration-এর জন্য নেটওয়ার্ক লাগতে পারে, যতক্ষণ না সেই hashed মডিউল runtime cache-এ যায়। একবার অনলাইনে ভিজিট করার পর ভিজিট করা পেজ (homepage সহ) runtime cache দিয়ে অফলাইনে খোলা যাবে।

### `pwa.precachePages`

| Value | Precached HTML |
| --- | --- |
| `false` (default) | শুধু homepage |
| `true` | সব prerendered HTML (historical version বাদ) |
| `string[]` | Homepage + URL prefix |

শুধু একটি locale এবং একটি version snapshot precache করতে:

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  pwa: {
    precachePages: ['/zh/', '/v/2026-08-27/'],
  },
})
```

আগের “সব পেজ cache করো” আচরণ ফিরিয়ে আনতে:

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  pwa: {
    precachePages: true,
  },
})
```

ভিজিট করা পেজ precache না থাকলেও runtime cache দিয়ে অফলাইনে খোলা যাবে।

:::since[App-shell client precache]{version="2026-09-09" id="pwa-precache-client" summary="Default client precache is the app shell; precacheClient restores the catch-all glob."}

### `pwa.precacheClient`

| Value | Precached client files |
| --- | --- |
| `false` (default) | শুধু app shell (entry + CSS / fonts + root icon) |
| `true` | সব matching client file |

আগের “সব client JS/CSS মডিউল precache করো” আচরণ ফিরিয়ে আনতে:

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  pwa: {
    precacheClient: true,
  },
})
```

`precachePages` এবং `precacheClient` আলাদা: HTML policy client glob বদলায় না, আবার উল্টোটাও না।
:::

## কনফিগের উদাহরণ

এই সাইটের কনফিগ উদাহরণ হিসেবে দেখুন:

@code(/config/pwa.ts)
