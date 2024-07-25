---
title: Frontmatter in default theme
---

## শেয়ার্ড Frontmatter

```ts
interface CommonFrontmatter {
  title?: string
  description?: string
  lastUpdate?: string
}
```

### `title`
পেজের ফাইনাল টাইটাল হবে `page frontmatter title | siteConfig.title`  

### `description`
পেজের ফাইনাল ডেসক্রিপশন `siteConfig.description` ব্যবহার না করে পেজের ফ্রন্টম্যাটার ব্যবহার করবে, যদি `description` সেখানে থাকে। 
  
###  `lastUpdate` 

এটি পেজের নিচের "last update at: " তে পরিবর্তন আনবে।  
ডিফল্টে +page এর গিট কমিটের টাইম দেখাবে।    
এই ফিল্ড কনফিগ করে আপনি তা ওভাররাইড করতে পারবেন। 

### `sidebar`

সাইডবার দেখাবে কিনা তা নির্ধারণ করে। ডিফল্ট হচ্ছে `true`। সাইডবার হাইড করতে `false` করে দিন। 

### `header`

হেডার দেখাবে কিনা তা নির্ধারণ করে। ডিফল্ট হচ্ছে `true`। হেডার হাইড করতে `false` করে দিন। 

## বিশেষ frontmatter

* [হোম পেজ frontmatter](/guide/default-theme/home-page/#Frontmatter)