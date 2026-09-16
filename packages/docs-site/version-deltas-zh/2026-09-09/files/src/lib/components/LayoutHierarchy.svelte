<script lang="ts">
  import { page } from '$app/state'

  interface Props {
    locale?: 'en' | 'zh' | 'bn'
  }

  const { locale }: Props = $props()

  const detectedLocale = $derived.by(() => {
    if (locale) return locale
    const pathname = page.url.pathname
    if (pathname.startsWith('/zh')) return 'zh'
    if (pathname.startsWith('/bn')) return 'bn'
    return 'en'
  })

  let activeIndex = $state<number | null>(null)
  let viewMode = $state<'nested' | 'tree'>('nested')

  interface Layer {
    id: string
    code: string
    color: string
    colorLight: string
    colorDark: string
    bgLight: string
    bgDark: string
    borderLight: string
    borderDark: string
    name: Record<string, string>
    badge: Record<string, string>
    badgeType: 'theme' | 'file' | 'page'
    desc: Record<string, string>
    details: Record<string, string>
    features: Record<string, string[]>
  }

  const layers: Layer[] = [
    {
      id: 'global-layout',
      code: 'theme.globalLayout',
      color: '#f43f5e',
      colorLight: '#e11d48',
      colorDark: '#fb7185',
      bgLight: 'rgba(244, 63, 94, 0.035)',
      bgDark: 'rgba(244, 63, 94, 0.08)',
      borderLight: 'rgba(244, 63, 94, 0.45)',
      borderDark: 'rgba(251, 113, 133, 0.55)',
      badgeType: 'theme',
      name: {
        en: 'Theme Global Layout',
        zh: '主题全局布局',
        bn: 'থিম গ্লোবাল লেআউট',
      },
      badge: {
        en: 'Theme Global',
        zh: '主题全局',
        bn: 'থিম গ্লোবাল',
      },
      desc: {
        en: 'Outermost shell injected by theme (HTML head, theme toggle, search modal & global styles).',
        zh: '主题注入的最外层骨架（HTML Head、亮暗模式、搜索弹窗及全局样式）。',
        bn: 'থিম প্রদত্ত সবচেয়ে বাইরের শেল (HTML হেড, থিম টগল, সার্চ ও গ্লোবাল স্টাইল)।',
      },
      details: {
        en: 'Wraps the entire SvelteKit application. Manages dark mode, meta tags, and global UI providers.',
        zh: '包裹整个 SvelteKit 应用。统一维护暗黑模式、Meta 标签及全局 Provider 组件。',
        bn: 'সম্পূর্ণ SvelteKit অ্যাপ্লিকেশনকে ঘিরে রাখে। ডার্ক মোড, মেটা ট্যাগ এবং গ্লোবাল প্রোভাইডার পরিচালনা করে।',
      },
      features: {
        en: ['HTML & Head tags', 'Theme toggle state', 'Global UI providers'],
        zh: ['HTML 根标签与 Head', '亮暗色彩状态管理', '全局 UI Provider'],
        bn: ['HTML ও Head ট্যাগ', 'থিম টগল স্টেট', 'গ্লোবাল UI প্রোভাইডার'],
      },
    },
    {
      id: 'root-layout',
      code: 'src/routes/+layout.(svelte|md)',
      color: '#0ea5e9',
      colorLight: '#0284c7',
      colorDark: '#38bdf8',
      bgLight: 'rgba(14, 165, 233, 0.035)',
      bgDark: 'rgba(14, 165, 233, 0.08)',
      borderLight: 'rgba(14, 165, 233, 0.45)',
      borderDark: 'rgba(56, 189, 248, 0.55)',
      badgeType: 'file',
      name: {
        en: 'App Root Layout',
        zh: '项目根布局',
        bn: 'অ্যাপ রুট লেআউট',
      },
      badge: {
        en: 'Root Layout',
        zh: '根布局文件',
        bn: 'রুট লেআউট',
      },
      desc: {
        en: 'Mandatory root layout file in your SvelteKit project; site-wide custom logic and scripts belong here.',
        zh: '项目必须创建的根布局文件；全站通用的业务逻辑、脚本和自定义样式放在这里。',
        bn: 'SvelteKit প্রজেক্টে বাধ্যতামূলক রুট লেআউট; সাইট-ওয়াইড কাস্টম লজিক ও স্ক্রিপ্ট এখানে থাকে।',
      },
      details: {
        en: 'Required by Sveltepress so theme.globalLayout can bind correctly to SvelteKit route hierarchy.',
        zh: 'Sveltepress 必需文件，用于将 theme.globalLayout 与 SvelteKit 路由树正确连接。',
        bn: 'Sveltepress-এর জন্য আবশ্যক যাতে theme.globalLayout সঠিকভাবে SvelteKit রুটের সাথে যুক্ত হতে পারে।',
      },
      features: {
        en: [
          'Site-wide scripts',
          'Global custom CSS',
          'SvelteKit root context',
        ],
        zh: [
          '全站脚本与第三方 SDK',
          '用户自定义样式覆盖',
          'SvelteKit 根上下文',
        ],
        bn: [
          'সাইট-ওয়াইড স্ক্রিপ্ট',
          'কাস্টম গ্লোবাল CSS',
          'SvelteKit রুট কনটেক্সট',
        ],
      },
    },
    {
      id: 'page-layout',
      code: 'theme.pageLayout',
      color: '#f59e0b',
      colorLight: '#d97706',
      colorDark: '#fbbf24',
      bgLight: 'rgba(245, 158, 11, 0.035)',
      bgDark: 'rgba(245, 158, 11, 0.08)',
      borderLight: 'rgba(245, 158, 11, 0.45)',
      borderDark: 'rgba(251, 191, 36, 0.55)',
      badgeType: 'theme',
      name: {
        en: 'Theme Page Layout',
        zh: '主题页面布局',
        bn: 'থিম পেজ লেআউট',
      },
      badge: {
        en: 'Page Shell',
        zh: '文档页面外壳',
        bn: 'পেজ শেল',
      },
      desc: {
        en: 'Documentation page framework providing top navigation, sidebar, table of contents, and pagination.',
        zh: '文档页面骨架，内置顶部导航栏、左侧菜单栏、右侧文章目录 (TOC) 和底部分页。',
        bn: 'ডকুমেন্টেশন পেজ ফ্রেমওয়ার্ক যা নেভবার, সাইডবার, সূচিপত্র ও পেজিনেশন প্রদান করে।',
      },
      details: {
        en: 'Automatically wraps markdown/page routes unless disabled via frontmatter layout: false.',
        zh: '默认自动包裹所有文档页面，可在 Frontmatter 中设置 layout: false 禁用。',
        bn: 'ডিফল্টভাবে সমস্ত পেজে প্রয়োগ হয়, frontmatter-এ layout: false দিয়ে নিষ্ক্রিয় করা যায়।',
      },
      features: {
        en: [
          'Top Navbar & mobile menu',
          'Sidebar navigation',
          'TOC & page switcher',
        ],
        zh: ['顶部 Navbar 与移动端导航', '可折叠侧边栏', 'TOC 目录与前后翻页'],
        bn: [
          'টপ নেভবার ও মোবাইল মেনু',
          'সাইডবার নেভিগেশন',
          'TOC এবং পেজ সুইচার',
        ],
      },
    },
    {
      id: 'sub-layout',
      code: 'src/routes/foo/+layout.(md|svelte)',
      color: '#6366f1',
      colorLight: '#4f46e5',
      colorDark: '#818cf8',
      bgLight: 'rgba(99, 102, 241, 0.035)',
      bgDark: 'rgba(99, 102, 241, 0.08)',
      borderLight: 'rgba(99, 102, 241, 0.45)',
      borderDark: 'rgba(129, 140, 248, 0.55)',
      badgeType: 'file',
      name: {
        en: 'Nested Section Layout',
        zh: '嵌套子路由布局',
        bn: 'নেস্টেড সাব-লেআউট',
      },
      badge: {
        en: 'Section Layout',
        zh: '子路由布局',
        bn: 'সাব-লেআউট',
      },
      desc: {
        en: 'Optional sub-layout file scoped to /foo/* section routes for sectional wrappers.',
        zh: '可选的局部布局文件，仅作用于当前 /foo/* 路径下的所有子页面。',
        bn: 'ঐচ্ছিক সাব-লেআউট যা শুধুমাত্র /foo/* পাথের ভেতরের পেজগুলোতে প্রভাব ফেলে।',
      },
      details: {
        en: 'Allows adding custom sub-headers, banners, or section-specific sidebar overrides.',
        zh: '可用于添加模块专属顶部横幅、局部次级导航或针对该目录的特定逻辑。',
        bn: 'কাস্টম সাব-হেডার, ব্যানার বা নির্দিষ্ট সেকশনের জন্য বিশেষ নেভিগেশন যুক্ত করতে ব্যবহৃত হয়।',
      },
      features: {
        en: [
          'Scoped to /foo/*',
          'Sub-navigation / banners',
          'Local route state',
        ],
        zh: ['仅作用于 /foo/*', '局部次级导航 / 横幅', '模块局部状态与逻辑'],
        bn: [
          '/foo/* পাথে সীমাবদ্ধ',
          'সাব-নেভিগেশন / ব্যানার',
          'লোকাল রুট স্টেট',
        ],
      },
    },
    {
      id: 'leaf-page',
      code: 'src/routes/foo/+page.(md|svelte)',
      color: '#10b981',
      colorLight: '#059669',
      colorDark: '#34d399',
      bgLight: 'rgba(16, 185, 129, 0.05)',
      bgDark: 'rgba(16, 185, 129, 0.1)',
      borderLight: 'rgba(16, 185, 129, 0.55)',
      borderDark: 'rgba(52, 211, 153, 0.65)',
      badgeType: 'page',
      name: {
        en: 'Leaf Page Content',
        zh: '终端页面内容',
        bn: 'টার্মিনাল পেজ কন্টেন্ট',
      },
      badge: {
        en: 'Page Content',
        zh: '页面内容',
        bn: 'পেজ কন্টেন্ট',
      },
      desc: {
        en: 'Your actual documentation content written in Markdown or Svelte, rendered inside all parent layouts.',
        zh: '最终撰写的文档或 Svelte 页面正文，逐层嵌套渲染在上述所有布局组件的内部中心。',
        bn: 'আপনার আসল ডকুমেন্টেশন কন্টেন্ট (মার্কডাউন বা Svelte), যা সমস্ত প্যারেন্ট লেআউটের ভেতরে রেন্ডার হয়।',
      },
      details: {
        en: 'Supports rich markdown, Twoslash code blocks, interactive Svelte components, and custom frontmatter.',
        zh: '支持丰富 Markdown 语法、Twoslash 类型提示、交互式 Svelte 组件及 Frontmatter。',
        bn: 'রিচ মার্কডাউন, Twoslash কোড ব্লক, ইন্টারেক্টিভ Svelte কম্পোনেন্ট ও ফ্রন্টম্যাটার সমর্থন করে।',
      },
      features: {
        en: [
          'Markdown & Svelte',
          'Twoslash code blocks',
          'Interactive components',
        ],
        zh: [
          'Markdown 与 Svelte 混合',
          'Twoslash 类型注释代码块',
          '交互式 Svelte 组件',
        ],
        bn: [
          'মার্কডাউন ও Svelte',
          'Twoslash কোড ব্লক',
          'ইন্টারেক্টিভ কম্পোনেন্ট',
        ],
      },
    },
  ]

  const texts = $derived.by(() => {
    switch (detectedLocale) {
      case 'zh':
        return {
          title: '布局嵌套层级关系',
          subtitle: '由外至内展示全局主题、项目布局与页面内容的逐层包裹顺序',
          nestedView: '嵌套视图',
          treeView: '结构树',
          themeTag: '主题内置',
          fileTag: '项目文件',
          pageTag: '页面内容',
          hoverTip: '悬停或点击任意层级查看详细说明与职能',
          activeLayer: '当前选中层级',
          roleLabel: '类型',
          renderSlot: '页面渲染插槽',
          sampleTitle: '文档页面正文内容',
          sampleText:
            '此处渲染 Markdown 技术文档、代码高亮块或自定义 Svelte 组件...',
        }
      case 'bn':
        return {
          title: 'লেআউট নেস্টিং কাঠামো',
          subtitle:
            'থিম, প্রজেক্ট লেআউট এবং পেজ কন্টেন্টের ভেতর-বাইরের র‍্যাপিং অনুক্রম',
          nestedView: 'নেস্টেড ভিউ',
          treeView: 'ট্রি ভিউ',
          themeTag: 'থিম বিল্ট-ইন',
          fileTag: 'প্রজেক্ট ফাইল',
          pageTag: 'পেজ কন্টেন্ট',
          hoverTip: 'বিস্তারিত দেখতে যেকোনো স্তরে হোভার বা ট্যাপ করুন',
          activeLayer: 'নির্বাচিত স্তর',
          roleLabel: 'ধরন',
          renderSlot: 'পেজ স্লট সেন্টার',
          sampleTitle: 'ডকুমেন্টেশন পেজ কন্টেন্ট',
          sampleText:
            'এখানে মার্কডাউন ডকুমেন্ট, কোড ব্লক অথবা Svelte কম্পোনেন্ট রেন্ডার হয়...',
        }
      default:
        return {
          title: 'Layout Nesting Hierarchy',
          subtitle:
            'Visualizing how global themes, project layouts, and leaf pages wrap into each other',
          nestedView: 'Nested View',
          treeView: 'Tree View',
          themeTag: 'Theme',
          fileTag: 'Project File',
          pageTag: 'Page Content',
          hoverTip: 'Hover or tap any layer to inspect its role and details',
          activeLayer: 'Active Layer',
          roleLabel: 'Type',
          renderSlot: 'Page Slot Center',
          sampleTitle: 'Documentation Page Content',
          sampleText:
            'Markdown technical documentation, code blocks, or custom Svelte components render here...',
        }
    }
  })

  const currentLayer = $derived(
    activeIndex !== null ? layers[activeIndex] : null,
  )

  function getBadgeLabel(layer: Layer) {
    if (layer.badgeType === 'theme') return texts.themeTag
    if (layer.badgeType === 'file') return texts.fileTag
    return texts.pageTag
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      activeIndex = activeIndex === index ? null : index
    }
  }

  function handleNestedMouseMove(e: MouseEvent) {
    const target = (e.target as HTMLElement | null)?.closest?.(
      '[data-layer-index]',
    )
    if (target) {
      const idx = Number(target.getAttribute('data-layer-index'))
      if (!Number.isNaN(idx)) {
        activeIndex = idx
        return
      }
    }
    activeIndex = null
  }

  function handleNestedMouseLeave() {
    activeIndex = null
  }
</script>

<div class="layout-hierarchy-card">
  <!-- Card Header -->
  <div class="card-header">
    <div class="header-left">
      <div class="title-row">
        <span class="icon-indicator">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </span>
        <span class="card-title">{texts.title}</span>
      </div>
      <p class="card-subtitle">{texts.subtitle}</p>
    </div>

    <!-- View Mode Switcher -->
    <div class="view-toggle" role="group" aria-label="View toggle">
      <button
        type="button"
        class="toggle-btn"
        class:active={viewMode === 'nested'}
        onclick={() => (viewMode = 'nested')}
      >
        <svg
          width="14"
          height="14"
          class="toggle-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
        </svg>
        <span>{texts.nestedView}</span>
      </button>
      <button
        type="button"
        class="toggle-btn"
        class:active={viewMode === 'tree'}
        onclick={() => (viewMode = 'tree')}
      >
        <svg
          width="14"
          height="14"
          class="toggle-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="6" y1="3" x2="6" y2="21"></line>
          <line x1="6" y1="8" x2="18" y2="8"></line>
          <line x1="6" y1="16" x2="18" y2="16"></line>
        </svg>
        <span>{texts.treeView}</span>
      </button>
    </div>
  </div>

  <!-- Breadcrumbs / Wrap Flow Bar -->
  <div class="flow-bar" role="navigation" aria-label="Wrapping flow">
    <div class="flow-track">
      {#each layers as layer, i}
        <button
          type="button"
          class="flow-pill"
          class:is-active={activeIndex === i}
          style="--pill-color: {layer.color};"
          onmouseenter={() => (activeIndex = i)}
          onmouseleave={() => {
            if (activeIndex === i) activeIndex = null
          }}
          onclick={() => (activeIndex = activeIndex === i ? null : i)}
        >
          <span class="flow-index">{i + 1}</span>
          <span class="flow-code">{layer.code}</span>
        </button>

        {#if i < layers.length - 1}
          <span class="flow-arrow" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Main View Area -->
  <div class="diagram-body">
    {#if viewMode === 'nested'}
      <!-- Concentric Nested Boxes View -->
      <div
        class="nested-container"
        onmousemove={handleNestedMouseMove}
        onmouseleave={handleNestedMouseLeave}
        role="group"
        aria-label="Nested Layout Hierarchy"
      >
        <!-- Layer 0: theme.globalLayout -->
        <div
          class="box layer-0"
          class:highlight={activeIndex === 0}
          data-layer-index="0"
          style="--layer-color: {layers[0]
            .color}; --layer-color-light: {layers[0]
            .colorLight}; --layer-color-dark: {layers[0]
            .colorDark}; --layer-bg-light: {layers[0]
            .bgLight}; --layer-bg-dark: {layers[0]
            .bgDark}; --layer-border-light: {layers[0]
            .borderLight}; --layer-border-dark: {layers[0].borderDark};"
          tabindex="0"
          role="button"
          aria-label={layers[0].code}
          onclick={e => {
            e.stopPropagation()
            activeIndex = activeIndex === 0 ? null : 0
          }}
          onkeydown={e => handleKeydown(e, 0)}
        >
          <div class="box-header">
            <div class="box-title">
              <span class="layer-dot"></span>
              <span class="code-name">{layers[0].code}</span>
            </div>
            <span class="type-badge badge-theme"
              >{getBadgeLabel(layers[0])}</span
            >
          </div>

          <!-- Layer 1: src/routes/+layout.(svelte|md) -->
          <div
            class="box layer-1"
            class:highlight={activeIndex === 1}
            data-layer-index="1"
            style="--layer-color: {layers[1]
              .color}; --layer-color-light: {layers[1]
              .colorLight}; --layer-color-dark: {layers[1]
              .colorDark}; --layer-bg-light: {layers[1]
              .bgLight}; --layer-bg-dark: {layers[1]
              .bgDark}; --layer-border-light: {layers[1]
              .borderLight}; --layer-border-dark: {layers[1].borderDark};"
            tabindex="0"
            role="button"
            aria-label={layers[1].code}
            onclick={e => {
              e.stopPropagation()
              activeIndex = activeIndex === 1 ? null : 1
            }}
            onkeydown={e => handleKeydown(e, 1)}
          >
            <div class="box-header">
              <div class="box-title">
                <span class="layer-dot"></span>
                <span class="code-name">{layers[1].code}</span>
              </div>
              <span class="type-badge badge-file"
                >{getBadgeLabel(layers[1])}</span
              >
            </div>

            <!-- Layer 2: theme.pageLayout -->
            <div
              class="box layer-2"
              class:highlight={activeIndex === 2}
              data-layer-index="2"
              style="--layer-color: {layers[2]
                .color}; --layer-color-light: {layers[2]
                .colorLight}; --layer-color-dark: {layers[2]
                .colorDark}; --layer-bg-light: {layers[2]
                .bgLight}; --layer-bg-dark: {layers[2]
                .bgDark}; --layer-border-light: {layers[2]
                .borderLight}; --layer-border-dark: {layers[2].borderDark};"
              tabindex="0"
              role="button"
              aria-label={layers[2].code}
              onclick={e => {
                e.stopPropagation()
                activeIndex = activeIndex === 2 ? null : 2
              }}
              onkeydown={e => handleKeydown(e, 2)}
            >
              <div class="box-header">
                <div class="box-title">
                  <span class="layer-dot"></span>
                  <span class="code-name">{layers[2].code}</span>
                </div>
                <span class="type-badge badge-theme"
                  >{getBadgeLabel(layers[2])}</span
                >
              </div>

              <!-- Layer 3: src/routes/foo/+layout.(md|svelte) -->
              <div
                class="box layer-3"
                class:highlight={activeIndex === 3}
                data-layer-index="3"
                style="--layer-color: {layers[3]
                  .color}; --layer-color-light: {layers[3]
                  .colorLight}; --layer-color-dark: {layers[3]
                  .colorDark}; --layer-bg-light: {layers[3]
                  .bgLight}; --layer-bg-dark: {layers[3]
                  .bgDark}; --layer-border-light: {layers[3]
                  .borderLight}; --layer-border-dark: {layers[3].borderDark};"
                tabindex="0"
                role="button"
                aria-label={layers[3].code}
                onclick={e => {
                  e.stopPropagation()
                  activeIndex = activeIndex === 3 ? null : 3
                }}
                onkeydown={e => handleKeydown(e, 3)}
              >
                <div class="box-header">
                  <div class="box-title">
                    <span class="layer-dot"></span>
                    <span class="code-name">{layers[3].code}</span>
                  </div>
                  <span class="type-badge badge-file"
                    >{getBadgeLabel(layers[3])}</span
                  >
                </div>

                <!-- Layer 4: src/routes/foo/+page.(md|svelte) (Innermost) -->
                <div
                  class="box layer-4"
                  class:highlight={activeIndex === 4}
                  data-layer-index="4"
                  style="--layer-color: {layers[4]
                    .color}; --layer-color-light: {layers[4]
                    .colorLight}; --layer-color-dark: {layers[4]
                    .colorDark}; --layer-bg-light: {layers[4]
                    .bgLight}; --layer-bg-dark: {layers[4]
                    .bgDark}; --layer-border-light: {layers[4]
                    .borderLight}; --layer-border-dark: {layers[4].borderDark};"
                  tabindex="0"
                  role="button"
                  aria-label={layers[4].code}
                  onclick={e => {
                    e.stopPropagation()
                    activeIndex = activeIndex === 4 ? null : 4
                  }}
                  onkeydown={e => handleKeydown(e, 4)}
                >
                  <div class="box-header">
                    <div class="box-title">
                      <span class="layer-dot"></span>
                      <span class="code-name">{layers[4].code}</span>
                    </div>
                    <span class="type-badge badge-page"
                      >{getBadgeLabel(layers[4])}</span
                    >
                  </div>

                  <!-- Inner Page Content Preview -->
                  <div class="page-preview-body">
                    <div class="preview-header">
                      <span class="doc-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          ></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </span>
                      <span class="preview-title">{texts.sampleTitle}</span>
                      <span class="render-badge">
                        <span class="slot-dot"></span>
                        {texts.renderSlot}
                      </span>
                    </div>
                    <p class="preview-text">{texts.sampleText}</p>
                    <div class="mock-lines" aria-hidden="true">
                      <div class="mock-line w-11/12"></div>
                      <div class="mock-line w-8/12"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Hierarchical Tree View -->
      <div class="tree-container">
        {#each layers as layer, i}
          <div
            class="tree-node"
            class:is-active={activeIndex === i}
            style="--layer-color: {layer.color}; --layer-color-light: {layer.colorLight}; --layer-color-dark: {layer.colorDark}; padding-left: {i *
              1.25}rem;"
            onmouseenter={() => (activeIndex = i)}
            onmouseleave={() => {
              if (activeIndex === i) activeIndex = null
            }}
            onclick={() => (activeIndex = activeIndex === i ? null : i)}
            role="button"
            tabindex="0"
            onkeydown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                activeIndex = activeIndex === i ? null : i
              }
            }}
          >
            <div class="tree-card">
              <div class="tree-card-top">
                <span class="layer-dot"></span>
                <span class="code-name">{layer.code}</span>
                <span
                  class="type-badge"
                  class:badge-theme={layer.badgeType === 'theme'}
                  class:badge-file={layer.badgeType === 'file'}
                  class:badge-page={layer.badgeType === 'page'}
                >
                  {getBadgeLabel(layer)}
                </span>
              </div>
              <p class="tree-card-desc">
                {layer.desc[detectedLocale] || layer.desc.en}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Bottom Interactive Inspector Panel -->
  <div class="card-footer">
    {#if currentLayer}
      <div class="inspector-active">
        <div class="inspector-header">
          <div class="inspector-title">
            <span
              class="inspector-dot"
              style="background-color: {currentLayer.color};"
            ></span>
            <span class="inspector-code" style="color: {currentLayer.color};"
              >{currentLayer.code}</span
            >
            <span
              class="type-badge"
              class:badge-theme={currentLayer.badgeType === 'theme'}
              class:badge-file={currentLayer.badgeType === 'file'}
              class:badge-page={currentLayer.badgeType === 'page'}
            >
              {currentLayer.name[detectedLocale] || currentLayer.name.en}
            </span>
          </div>
          <span class="inspector-hint">{texts.activeLayer}</span>
        </div>
        <p class="inspector-desc">
          {currentLayer.desc[detectedLocale] || currentLayer.desc.en}
        </p>
        <div class="inspector-features">
          {#each currentLayer.features[detectedLocale] || currentLayer.features.en as feat}
            <span class="feature-tag">
              <svg
                width="12"
                height="12"
                class="feature-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {feat}
            </span>
          {/each}
        </div>
      </div>
    {:else}
      <div class="inspector-idle">
        <svg
          width="16"
          height="16"
          class="idle-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span class="idle-text">{texts.hoverTip}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .layout-hierarchy-card {
    --at-apply: 'my-8 rounded-2xl b-1 b-solid b-black/8 dark:b-white/10 bg-zinc-50/70 dark:bg-[#18181b]/90 backdrop-blur-md shadow-sm overflow-hidden';
    font-family: inherit;
  }

  /* Card Header */
  .card-header {
    --at-apply: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 b-b-1 b-b-solid b-b-black/6 dark:b-b-white/8 bg-white/70 dark:bg-[#1f1f23]/60';
  }

  .header-left {
    --at-apply: 'flex flex-col gap-1';
  }

  .title-row {
    --at-apply: 'flex items-center gap-2 font-700 text-zinc-800 dark:text-zinc-100 text-base sm:text-lg';
  }

  .icon-indicator {
    --at-apply: 'inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex-shrink-0';
  }

  .icon-indicator svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .card-subtitle {
    --at-apply: 'm-0 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400';
  }

  /* View Mode Switcher */
  .view-toggle {
    --at-apply: 'inline-flex items-center p-0.5 rounded-lg b-1 b-solid b-black/8 dark:b-white/10 bg-zinc-100 dark:bg-[#141416] self-start sm:self-center flex-shrink-0';
  }

  .toggle-btn {
    --at-apply: 'inline-flex items-center px-2.5 py-1 text-xs font-600 rounded-md text-zinc-600 dark:text-zinc-400 bg-transparent b-0 cursor-pointer transition-colors';
  }

  .toggle-btn.active {
    --at-apply: 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm';
  }

  .toggle-svg {
    width: 14px;
    height: 14px;
    margin-right: 4px;
    flex-shrink: 0;
  }

  /* Flow Bar */
  .flow-bar {
    --at-apply: 'px-3.5 py-2.5 sm:px-6 b-b-1 b-b-solid b-b-black/5 dark:b-b-white/6 bg-black/[0.015] dark:bg-white/[0.015] overflow-x-auto';
    scrollbar-width: thin;
  }

  .flow-track {
    --at-apply: 'flex items-center gap-1.5 min-w-max';
  }

  .flow-pill {
    --at-apply: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-600 b-1 b-solid cursor-pointer transition-all';
    border-color: rgba(0, 0, 0, 0.08);
    background-color: rgba(255, 255, 255, 0.85);
    color: var(--pill-color);
  }

  :global(.dark) .flow-pill {
    border-color: rgba(255, 255, 255, 0.09);
    background-color: rgba(255, 255, 255, 0.04);
  }

  .flow-pill:hover,
  .flow-pill.is-active {
    border-color: var(--pill-color);
    background-color: rgba(0, 0, 0, 0.03);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  :global(.dark) .flow-pill:hover,
  :global(.dark) .flow-pill.is-active {
    background-color: rgba(255, 255, 255, 0.09);
  }

  .flow-index {
    --at-apply: 'inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white flex-shrink-0';
    background-color: var(--pill-color);
  }

  .flow-code {
    --at-apply: 'tracking-tight';
  }

  .flow-arrow {
    --at-apply: 'text-zinc-400 dark:text-zinc-600 flex items-center flex-shrink-0';
  }

  .flow-arrow svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  /* Body Area */
  .diagram-body {
    --at-apply: 'p-3 sm:p-5 md:p-6';
  }

  /* Concentric Boxes */
  .nested-container {
    --at-apply: 'w-full';
  }

  .box {
    --at-apply: 'relative b-1.5 b-solid transition-all duration-200 cursor-pointer outline-none';
    border-color: var(--layer-border-light);
    background-color: var(--layer-bg-light);
  }

  :global(.dark) .box {
    border-color: var(--layer-border-dark);
    background-color: var(--layer-bg-dark);
  }

  .box:focus-visible,
  .box.highlight {
    border-color: var(--layer-color);
    box-shadow: 0 0 16px -2px var(--layer-color);
  }

  .box-header {
    --at-apply: 'flex items-center justify-between gap-2 mb-2 select-none flex-wrap';
  }

  .box-title {
    --at-apply: 'flex items-center gap-2 min-w-0';
  }

  .layer-dot {
    --at-apply: 'inline-block w-2.5 h-2.5 rounded-full flex-shrink-0';
    background-color: var(--layer-color);
    box-shadow: 0 0 6px var(--layer-color);
  }

  .code-name {
    --at-apply: 'text-xs sm:text-[13px] font-mono font-bold tracking-tight';
    color: var(--layer-color-light);
  }

  :global(.dark) .code-name {
    color: var(--layer-color-dark);
  }

  /* Specific Layer Radii and Paddings */
  .layer-0 {
    --at-apply: 'p-2.5 sm:p-4 md:p-5 rounded-2xl';
  }

  .layer-1 {
    --at-apply: 'p-2 sm:p-3.5 md:p-4 rounded-xl';
  }

  .layer-2 {
    --at-apply: 'p-2 sm:p-3 md:p-3.5 rounded-lg';
  }

  .layer-3 {
    --at-apply: 'p-2 sm:p-2.5 md:p-3 rounded-md';
  }

  .layer-4 {
    --at-apply: 'p-2 sm:p-2.5 rounded';
  }

  /* Badge Styles */
  .type-badge {
    --at-apply: 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-600 tracking-wide flex-shrink-0';
  }

  .badge-theme {
    --at-apply: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300';
  }

  .badge-file {
    --at-apply: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300';
  }

  .badge-page {
    --at-apply: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300';
  }

  /* Page Preview Inside Layer 4 */
  .page-preview-body {
    --at-apply: 'mt-2 p-3 sm:p-4 rounded-md b-1 b-dashed b-emerald-500/45 bg-white/75 dark:bg-[#141416]/75';
  }

  .preview-header {
    --at-apply: 'flex flex-wrap items-center gap-2 mb-1.5';
  }

  .doc-icon {
    --at-apply: 'text-emerald-600 dark:text-emerald-400 flex items-center flex-shrink-0';
  }

  .doc-icon svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .preview-title {
    --at-apply: 'text-xs sm:text-sm font-700 text-zinc-800 dark:text-zinc-100';
  }

  .render-badge {
    --at-apply: 'ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-600 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300';
  }

  .slot-dot {
    --at-apply: 'w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse';
  }

  .preview-text {
    --at-apply: 'm-0 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed';
  }

  .mock-lines {
    --at-apply: 'mt-2.5 flex flex-col gap-1.5';
  }

  .mock-line {
    --at-apply: 'h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700/60';
  }

  /* Tree View */
  .tree-container {
    --at-apply: 'flex flex-col gap-2.5 w-full py-1';
  }

  .tree-node {
    --at-apply: 'relative flex items-center transition-all cursor-pointer select-none outline-none';
  }

  .tree-card {
    --at-apply: 'w-full p-3 sm:p-3.5 rounded-xl b-1.5 b-solid b-black/8 dark:b-white/10 bg-white/80 dark:bg-[#1c1c20]/80 transition-all';
  }

  .tree-node:hover .tree-card,
  .tree-node:focus-visible .tree-card,
  .tree-node.is-active .tree-card {
    border-color: var(--layer-color);
    box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.1);
  }

  .tree-card-top {
    --at-apply: 'flex items-center gap-2 flex-wrap';
  }

  .tree-card-desc {
    --at-apply: 'm-0 mt-1 text-xs text-zinc-500 dark:text-zinc-400 pl-4.5';
  }

  /* Bottom Inspector */
  .card-footer {
    --at-apply: 'p-3.5 sm:px-6 sm:py-4 b-t-1 b-t-solid b-t-black/6 dark:b-t-white/8 bg-white/60 dark:bg-[#19191d]/60 min-h-[56px] flex items-center';
  }

  .inspector-idle {
    --at-apply: 'flex items-center justify-center gap-2 py-1 w-full text-xs text-zinc-400 dark:text-zinc-500';
  }

  .idle-svg {
    width: 16px !important;
    height: 16px !important;
    max-width: 16px !important;
    max-height: 16px !important;
    flex-shrink: 0 !important;
  }

  .idle-text {
    --at-apply: 'text-xs text-zinc-400 dark:text-zinc-500';
  }

  .inspector-active {
    --at-apply: 'flex flex-col gap-1.5 w-full';
  }

  .inspector-header {
    --at-apply: 'flex items-center justify-between gap-2 flex-wrap';
  }

  .inspector-title {
    --at-apply: 'flex items-center gap-2 min-w-0 flex-wrap';
  }

  .inspector-dot {
    --at-apply: 'w-2.5 h-2.5 rounded-full flex-shrink-0';
  }

  .inspector-code {
    --at-apply: 'text-xs sm:text-sm font-mono font-bold truncate';
  }

  .inspector-hint {
    --at-apply: 'text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-600';
  }

  .inspector-desc {
    --at-apply: 'm-0 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-normal';
  }

  .inspector-features {
    --at-apply: 'flex flex-wrap gap-2 mt-1';
  }

  .feature-tag {
    --at-apply: 'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-black/4 dark:bg-white/6 text-zinc-700 dark:text-zinc-300';
  }

  .feature-svg {
    width: 12px;
    height: 12px;
    margin-right: 4px;
    flex-shrink: 0;
  }
</style>
