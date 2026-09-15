# @sveltepress/theme-blog

A magazine-style Sveltepress theme for static editorial sites. It includes Markdown posts, a masonry index, pagination, tags and categories, RSS, per-post Open Graph images, Pagefind search, related posts, and optional Giscus comments.

## Installation

```bash
pnpm add -D @sveltepress/theme-blog @sveltepress/vite @sveltejs/adapter-static pagefind
```

## Usage

Configure the theme in `vite.config.ts`:

```ts
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        title: 'My Blog',
        description: 'Thoughts on Svelte and the web.',
        base: 'https://example.com',
        author: {
          name: 'Your Name',
        },
      }),
    }),
  ],
})
```

The theme generates a fully static site and scaffolds missing route files on the next development or production build. Store posts in `src/posts/` by default, configure SvelteKit with `@sveltejs/adapter-static`, and build the Pagefind index after Vite:

```json
{
  "scripts": {
    "build": "vite build && pagefind --site dist"
  }
}
```

## Browser containers

OG PNG generation uses a native resvg addon, which browser containers such as StackBlitz WebContainers cannot load. The theme probes whether native addons can load before importing the renderer, and it loads the renderer only when OG images are enabled. If addons are disabled or the renderer is unavailable, it warns and skips PNG generation without preventing the blog from starting or deleting existing images. Generate fresh OG images in a native Node.js environment before deployment, or set `ogImage: { enabled: false }` to skip the renderer entirely.

See the [blog theme guide](https://sveltepress.site/guide/blog-theme/getting-started/) and [live demo](https://sveltepress.github.io/sveltepress/blog-demo/) for the complete setup, configuration, and customization surface.

## License

MIT
