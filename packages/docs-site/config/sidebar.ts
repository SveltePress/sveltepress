export default {
  '/guide/': [
    {
      title: 'Introduction',
      collapsible: true,
      items: [
        {
          title: 'What is Sveltepress',
          to: '/guide/introduction/',
        },
        {
          title: 'Quick Start',
          to: '/guide/quick-start/',
        },
        {
          title: 'Themes',
          to: '/guide/themes/',
        },
        {
          title: 'Working with TypeScript',
          to: '/guide/typescript/',
        },
        {
          title: 'Nested',
          items: [
            {
              title: 'Basic Writing',
              to: '/guide/markdown/basic-writing/',
            },
            {
              title: 'Frontmatter',
              to: '/guide/markdown/frontmatter/',
            },
            {
              title: 'Svelte in Markdown',
              to: '/guide/markdown/svelte-in-markdown/',
            },
            {
              title: 'Nested',
              items: [
                {
                  title: 'Basic Writing',
                  to: '/guide/markdown/basic-writing/',
                },
                {
                  title: 'Frontmatter',
                  to: '/guide/markdown/frontmatter/',
                },
                {
                  title: 'Svelte in Markdown',
                  to: '/guide/markdown/svelte-in-markdown/',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Markdown features',
      items: [
        {
          title: 'Basic Writing',
          to: '/guide/markdown/basic-writing/',
        },
        {
          title: 'Frontmatter',
          to: '/guide/markdown/frontmatter/',
        },
        {
          title: 'Svelte in Markdown',
          to: '/guide/markdown/svelte-in-markdown/',
        },
      ],
    },
    {
      title: 'Default theme features',
      collapsible: true,
      items: [
        {
          title: 'Frontmatter',
          to: '/guide/default-theme/frontmatter/',
        },
        {
          title: 'Navbar',
          to: '/guide/default-theme/navbar/',
        },
        {
          title: 'Sidebar',
          to: '/guide/default-theme/sidebar/',
        },
        {
          title: 'Home page',
          to: '/guide/default-theme/home-page/',
        },
        {
          title: 'Built-in Components',
          to: '/guide/default-theme/builtin-components/',
        },
        {
          title: 'Headings & Anchors',
          to: '/guide/default-theme/headings-and-anchors/',
        },
        {
          title: 'Admonitions',
          to: '/guide/default-theme/admonitions/',
        },
        {
          title: 'Code related',
          to: '/guide/default-theme/code-related/',
        },
        {
          title: 'Twoslash',
          to: '/guide/default-theme/twoslash/',
        },
        {
          title: 'Unocss',
          to: '/guide/default-theme/unocss/',
        },
        {
          title: 'Docsearch',
          to: '/guide/default-theme/docsearch/',
        },
        {
          title: 'PWA',
          to: '/guide/default-theme/pwa/',
        },
        {
          title: 'Google Analytics',
          to: '/guide/default-theme/google-analytics/',
        },
      ],
    },
  ],
  '/reference/': [{
    title: 'Reference',
    items: [
      {
        title: 'Vite plugin',
        to: '/reference/vite-plugin/',
      },
      {
        title: 'Default theme',
        to: '/reference/default-theme/',
      },
    ],
  }],
}
