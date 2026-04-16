---
'@sveltepress/theme-blog': minor
---

Switch to a left-sidebar layout. The former top navbar is replaced by `<Sidebar>`, which renders the author identity (avatar, name, bio, socials, optional `about.html` block) alongside the nav links, search, and theme toggle. Adds a thin `<ReadingProgress>` bar at the top of the viewport on post pages. Removes the `<AuthorCard>` render at the end of posts and the auto-scaffolded `/about/` page — About info lives in the sidebar now.

Breaking:
- The standalone `/about/` page is no longer scaffolded. Delete any unmodified `src/routes/about/+page.svelte` the theme previously generated.
- The top-of-page `<Navbar>` component was removed; use `<Sidebar>` if you were consuming it directly.
- `AuthorCard` is no longer rendered inside `PostLayout`; re-add it in your own layout if you still want a post-end author block.
