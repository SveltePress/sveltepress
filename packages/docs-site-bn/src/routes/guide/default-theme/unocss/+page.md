---
title: Unocss
---

## ভূমিকা

ডিফল্ট থিম সকল স্টাইলের জন্য [Unocss](https://github.com/unocss/unocss) ব্যবহার করে। 

চলুন কিছু উদাহরণ দেখা যাক:

## সহজে ডার্ক মোড

লাইট মোডে নিচে প্রতি লাইনে ৩টি করে কার্ড দেখা যাবে, এবং ডার্ক মোডে ২টি করে নীল কার্ড দেখা যাবে। 
অল্প কোডে এটা করতে পারাটা খুবই ভাল, তাই না? 

```svelte live
<div class="grid grid-cols-3 gap-4 dark:grid-cols-2">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
</div>
<style>
  .card {
    --at-apply: h-[100px] flex items-center justify-center
      rounded bg-rose-5 dark:bg-blue-5;
  }
</style>
```

## সহজে একাধিক স্ক্রিনের যোগ্য করে তোলা

কী ঘটছে তা দেখার জন্য উইন্ডো সাইজ পরিবর্তন করুন অথবা অন্য ডিভাইস ব্যবহার করুন 

```svelte live
<div class="sm:text-5 sm:text-rose-5 text-blue-5 text-10">
  This is a text with different font size and color in wide or narrow width device
</div>
```

## সহজে pure css আইকন

```svelte live
<div class="text-[56px]">
  <div class="i-openmoji-red-apple"></div>
  <div class="i-openmoji-banana"></div>
  <div class="i-openmoji-grapes"></div>
</div>
```

## এবং আরো অনেক কিছু...

আরো বেশি কিছু করতে আপনার মেধা, বুদ্ধি ও জ্ঞান ব্যবহার করুন! 