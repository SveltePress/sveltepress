---
title: অ্যাডমনিশন
---

## গ্রামার

এই ফিচারটি [remark-directive](https://github.com/remarkjs/remark-directive) সমন্বিত করেছে। 

:::important[Icon pre-build required]{icon=tabler:icons}
এই iconify আইকনটি [প্রি-বিল্ড iconify আইকন কনফিগ](/reference/default-theme/#preBuildIconifyIcons) এ থাকতে হবে। 
:::

```md
:::tip|info|note|warning|important|caution[Title]{icon=icon-collection:icon-name}
Some admonition content
:::
```

## টিপ

```md live
:::tip[টিপ টাইটেল]
টিপের বর্ণনা  
:::

:::tip[কাস্টম আইকনযুক্ত টিপ]{icon=ph:smiley}
টিপের বর্ণনা  
:::
```

## ইনফো

```md live
:::info[ইনফোর শিরোনাম]
বিস্তারিত বর্ণনা
:::

:::info[কাস্টম আইকনযুক্ত ইনফোর শিরোনাম]{icon=ph:smiley}
বিস্তারিত বর্ণনা
:::
```

## নোট 

```md live
:::note[নোট টাইটেল]
নোটের বিস্তারিত
:::

:::note[কাস্টম আইকনযুক্ত নোট টাইটেল]{icon=ph:smiley}
নোটের বিস্তারিত
:::
```

## ওয়ার্নিং

```md live
:::warning[ওয়ার্নিং শিরোনাম]
সতর্কতার বর্ণনা
:::

:::warning[কাস্টম আইকনযুক্ত ওয়ার্নিং শিরোনাম]{icon=ph:smiley}
সতর্কতার বর্ণনা
:::
```
## ইমপর্ট্যান্ট

```md live
:::important[ইমপর্ট্যান্ট শিরোনাম]
কিছু গুরুত্বপূর্ণ তথ্য
:::

:::important[কাস্টম আইকনযুক্ত ইমপর্ট্যান্ট শিরোনাম]{icon=ph:smiley}
কিছু গুরুত্বপূর্ণ তথ্য
:::
```

## সতর্কতা
```md live
:::caution[সতর্কতার শিরোনাম]
সতর্কতার বিষয়বস্তু
:::

:::caution[কাস্টম আইকনযুক্ত সতর্কতার শিরোনাম]{icon=ph:smiley}
সতর্কতার বিষয়বস্তু
:::
```
