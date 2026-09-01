---
title: পরিচিতি
---

Sveltepress হচ্ছে একটি সাইট বানানোর টুল।
[Vitepress](https://vitepress.vuejs.org/) থেকে অনুপ্রাণিত।
[SvelteKit](https://kit.svelte.dev/), [Unocss](https://github.com/unocss/unocss) এর উপর নির্ভর করে তৈরী।

## প্রজেক্টের স্ট্র্যাকচার

হুবহু [Project structure - SvelteKit](https://kit.svelte.dev/docs/project-structure) এর মতই।

শুধু পার্থক্য এই যে- পেজ এবং লআউটের জন্য .md ফাইল ব্যবহার করা যাবে।

উদাহরণস্বরূপ:
* `src/routes/+page.md` হোমপেজ হিসেবে চিহ্নিত হবে।
* `src/routes/+layout.md` রুটের কাস্টম লেআউট।

:::tip[Sveltekit এর পূর্ণ শক্তি]{icon=logos:svelte-kit}
Sveltepress sveltekit এর পূর্ণ শক্তি অক্ষুণ্ণ রাখে। আপনি SSG এর চেয়েও বেশি কিছু করতে পারবেন।
যেমন, +page.server.js, +layout.server.js, hooks.server.js সার্ভার সাইড লজিক- যেমন অথেনটিকেশন, ডাটাবেস কানেকশন ইত্যাদির জন্য ব্যবহার করা যাবে।
:::

## লেআউট অনুক্রম

:::note[রুট লেআউট বাধ্যতামূলক]{icon=ph:layout-duotone}
অবশ্যই `src/routes/+layout.svelte` অথবা `src/routes/+layout.md` থাকতে হবে রুট লেআউট হিসেবে।
**অন্যথায় থিম থেকে আসা গ্লোবাল লেআউট কাজ করবে না!**
:::

যেমন আপনার ফাইল ট্রি দেখতে এইরকম হলে

```txt
.
├─ src
│  ├─ routes
│  │  └─ +layout.(svelte|md)
│  │  ├─ foo
│  │  │  ├─ +page.(svelte|md)
│  │  │  ├─ +layout.(svelte|md)
```

`theme.globalLayout` > `src/routes/+layout.(svelte|md)` > `theme.pageLayout` > `src/routes/foo/+layout.(md|svelte)` > `src/routes/foo/+page.md`

আপনাকে বুঝতে সাহায্য করার জন্য এখানে একটি গ্রাফ

<img src="/layout-hierarchy.png" style="width:100%;" alt="" />

## কনফিগারেশন

Sveltepress এর কনফিগ `@sveltepress/vite` ভিট প্লাগিনে পাঠিয়ে দেয়া হয়, সমস্ত অপশন সম্পূর্ণরূপে টাইপকৃত।

আরো বিস্তারিত জানার জন্য [ভিট প্লাগিন অপশন](/reference/vite-plugin/) পড়ুন।

## ডিপ্লয়মেন্ট
প্রথমেই [Adapters - SvelteKit](https://kit.svelte.dev/docs/adapters) পড়া জরুরী।
যদি আপনি `npm/yarn/pnpm create @sveltepress` ব্যবহার করে থাকেন তাহলে [Adapter Static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) ডিফল্ট হিসেবে ব্যবহৃত হবে।

কিন্তু আপনি নির্দ্বিধায়। যে কোনো অ্যাডাপ্টার পরিবর্তন করতে পারেন।
