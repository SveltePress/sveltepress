---
'@sveltepress/theme-default': minor
---

Silky cross-page morph for the navbar search pill and brand logo

Client-side navigations are now wrapped in the View Transitions API (same
capability the dark-mode reveal already uses): the search pill morphs between
its home/docs positions instead of the old two-step jump-then-slide, and the
brand logo flies between the navbar (home) and the sidebar (docs pages). The
page body still swaps instantly, the dark-toggle reveal is untouched,
`prefers-reduced-motion` is respected, and browsers without
`startViewTransition` fall back to a tightened CSS transition.
