import type { CatalogLocale, SuccessKind } from './catalog.ts'

export interface PlaygroundCopy {
  playground: string
  featureDirectory: string
  lede: string
  sliceSentence: string
  persistCaveat: string
  openInStackBlitz: string
  guide: string
  switchEntry: string
  playgroundHome: string
  loading: string
  loadingSub: string
  failedTitle: string
  failedCopy: string
  hostedEditor: string
  success: Record<SuccessKind, string>
}

const GROUPS: Record<string, Record<Exclude<CatalogLocale, 'en'>, string>> = {
  'Introduction': { zh: '介绍', bn: 'পরিচিতি' },
  'Markdown features': { zh: 'Markdown 相关', bn: 'Markdown এর ফিচারসমূহ' },
  'Default theme features': { zh: '默认主题特性', bn: 'ডিফল্ট থিমের ফিচারসমূহ' },
  'Blog theme features': { zh: '博客主题特性', bn: 'ব্লগ থিমের ফিচারসমূহ' },
  'Reference': { zh: '参考', bn: 'রেফারেন্স' },
  'All features': { zh: '全部特性', bn: 'সব ফিচার' },
}

const COPY: Record<CatalogLocale, PlaygroundCopy> = {
  en: {
    playground: 'Playground',
    featureDirectory: 'Feature directory',
    lede: 'Pick an Entry to auto-boot its Starter in the Hosted editor. This page never boots.',
    sliceSentence: 'The full Feature directory is 27 Entries. This cut proves the sandbox.',
    persistCaveat: 'Reloading or opening this URL always boots the Starter as authored. Keep edits with Save-fork in StackBlitz chrome. Open in StackBlitz opens the Starter as authored in a new tab and does not carry Hosted editor edits.',
    openInStackBlitz: 'Open in StackBlitz',
    guide: 'Guide',
    switchEntry: 'Switch Entry',
    playgroundHome: 'Playground home',
    loading: 'Booting Hosted editor…',
    loadingSub: 'Same-page auto-boot.',
    failedTitle: 'Hosted editor did not boot',
    failedCopy: 'Open the Starter as authored on stackblitz.com. This does not carry iframe edits — there are none if the embed never started.',
    hostedEditor: 'Hosted editor',
    success: {
      as: 'Author-success',
      degraded: 'Degraded',
      observation: 'Observation-only',
    },
  },
  zh: {
    playground: '演练场',
    featureDirectory: '功能目录',
    lede: '选择一条目即可在 Hosted editor 中自动启动对应 Starter。本页不会启动编辑器。',
    sliceSentence: '完整功能目录共 27 个条目。本次切片用于验证沙箱。',
    persistCaveat: '重新加载或打开此 URL 总会按作者提交的内容启动 Starter。请在 StackBlitz 界面中使用 Save-fork 保留编辑。Open in StackBlitz 会在新标签页打开作者提交的 Starter，不会带走 Hosted editor 中的编辑。',
    openInStackBlitz: '在 StackBlitz 中打开',
    guide: '指南',
    switchEntry: '切换条目',
    playgroundHome: '演练场首页',
    loading: '正在启动 Hosted editor…',
    loadingSub: '本页自动启动。',
    failedTitle: 'Hosted editor 未能启动',
    failedCopy: '在 stackblitz.com 打开作者提交的 Starter。这不会带走 iframe 中的编辑 — 若嵌入从未开始，则没有任何编辑。',
    hostedEditor: '托管编辑器',
    success: {
      as: '可编写验证',
      degraded: '降级',
      observation: '仅观察',
    },
  },
  bn: {
    playground: 'প্লেগ্রাউন্ড',
    featureDirectory: 'ফিচার ডিরেক্টরি',
    lede: 'একটি এন্ট্রি বেছে নিলে Hosted editor সেই Starter আপনাআপনি চালায়। এই পাতা কখনো এডিটর চালায় না।',
    sliceSentence: 'সম্পূর্ণ ফিচার ডিরেক্টরিতে 27টি এন্ট্রি আছে। এই কাট স্যান্ডবক্স প্রমাণ করে।',
    persistCaveat: 'এই URL রিলোড বা খুললে Starter সবসময় লেখকের মতোই চালু হয়। সম্পাদনা রাখতে StackBlitz ইন্টারফেসে Save-fork ব্যবহার করুন। Open in StackBlitz নতুন ট্যাবে লেখকের Starter খোলে এবং Hosted editor-এর সম্পাদনা নিয়ে যায় না।',
    openInStackBlitz: 'StackBlitz-এ খুলুন',
    guide: 'গাইড',
    switchEntry: 'এন্ট্রি বদলান',
    playgroundHome: 'প্লেগ্রাউন্ড হোম',
    loading: 'Hosted editor চালু হচ্ছে…',
    loadingSub: 'এই পাতাতেই আপনাআপনি চালু।',
    failedTitle: 'Hosted editor চালু হয়নি',
    failedCopy: 'stackblitz.com-এ লেখকের Starter খুলুন। এটি iframe-এর সম্পাদনা নিয়ে যায় না — এমবেড শুরু না হলে কোনো সম্পাদনাই নেই।',
    hostedEditor: 'হোস্টেড এডিটর',
    success: {
      as: 'লেখক-সাফল্য',
      degraded: 'অবনমিত',
      observation: 'শুধু পর্যবেক্ষণ',
    },
  },
}

export function playgroundCopy(locale: CatalogLocale): PlaygroundCopy {
  return COPY[locale]
}

export function localizedGroup(group: string, locale: CatalogLocale): string {
  if (locale === 'en')
    return group
  return GROUPS[group]?.[locale] ?? group
}
