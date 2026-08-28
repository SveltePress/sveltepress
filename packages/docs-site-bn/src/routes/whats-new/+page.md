---
title: Current version-এ নতুন কী
description: প্রতিটি SveltePress documentation version-এ যোগ হওয়া page ও গুরুত্বপূর্ণ section দেখুন।
home: true
heroImage: false
tagline: নতুন entry point থেকে গুরুত্বপূর্ণ documentation update—প্রতিটি release-এর পরিবর্তন এক জায়গায় দেখুন।
versionChanges:
  exclude: true
---

এই site-এ এখনও documentation snapshot চালু নেই, তাই অন্য language site-এর সঙ্গে একই route বজায় রাখতে page-টি রাখা হয়েছে।

Version management চালু হলে যেকোনো page-এ overview component import করুন:

```svelte
<script>
  import VersionChanges from '@sveltepress/theme-default/VersionChanges.svelte'
</script>

<VersionChanges />
```

সম্পূর্ণ setup-এর জন্য [ডকুমেন্ট সংস্করণ ব্যবস্থাপনা](/guide/version-management/) দেখুন।
