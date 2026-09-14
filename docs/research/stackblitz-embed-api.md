# What StackBlitz exposes for a docs-site embed

Research for [issue #453](https://github.com/SveltePress/sveltepress/issues/453) (map: [Docs-site Playground](https://github.com/SveltePress/sveltepress/issues/448)).

This note lists **capabilities and hard limits** from first-party StackBlitz / WebContainer sources. It does **not** pick a Playground product shape.

**Host context (this repo, not a StackBlitz claim):** `packages/docs-site` is a SvelteKit `adapter-static` site with `fallback: '404.html'`, deployed on Netlify (`packages/docs-site/netlify.toml`, `NODE_VERSION = "22"`). Locales are `/`, `/zh/`, `/bn/`. Current `netlify.toml` has locale redirects only; it does **not** set COOP/COEP. `src/hooks.server.js` only emits `lang`. Theme `sm` is `950px`.

Sources were read 2026-09-14. Pricing tables on `stackblitz.com/pricing` are client-rendered; quoted pricing facts below are from the FAQ copy on that page plus developer docs and the Terms of Service.

---

## 1. Embed mechanisms

StackBlitz exposes three distinct integration surfaces. They are not interchangeable.

### 1.1 Manual iframe URL (hosted Classic Editor)

StackBlitz documents iframe embedding as the way to show the **hosted editor** in a docs page. Open a project → Share → Embed, copy the URL, put it in an iframe. Example:

```html
<iframe src="https://stackblitz.com/edit/angular?embed=1"></iframe>
```

The same URL query options work on DEV (`{% stackblitz URL %}`) and Medium (paste the project URL). Further customization is via [embed URL options](#3-embed-controls).

Source: [Embedding projects](https://developer.stackblitz.com/guides/integration/embedding).

The parent page does **not** implement the editor. The iframe loads `https://stackblitz.com/...`. Observed response headers for `https://stackblitz.com/edit/vitejs-vite?embed=1` (2026-09-14) included `cross-origin-resource-policy: cross-origin`, session cookies (`_stackblitz_session` `Secure; HttpOnly; SameSite=None`, `CSRF-TOKEN` `Secure; SameSite=None`), and **no** `X-Frame-Options` and **no** `Content-Security-Policy`. A non-embed `/edit/...` response *did* send `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`.

### 1.2 JavaScript SDK (`@stackblitz/sdk`)

Current published package: **`@stackblitz/sdk@1.11.1`** (npm, 2026-07-01 changelog). Docs say ~3 kB gzipped (the older create-with-SDK guide still says 2 kB). Install from npm or UNPKG/jsDelivr UMD (`window.StackBlitzSDK`) / ESM.

Public methods ([SDK overview](https://developer.stackblitz.com/platform/api/javascript-sdk), source [`src/lib.ts`](https://github.com/stackblitz/sdk/blob/main/src/lib.ts)):

| Method | What it does |
| --- | --- |
| `embedProjectId(el, projectId, embedOptions)` | iframe `src` = `{origin}/edit/{projectId}?embed=1&…` |
| `embedGithubProject(el, repoPath, embedOptions)` | iframe `src` = `{origin}/github/{repoPath}?embed=1&…` |
| `embedProject(el, project, embedOptions)` | POST payload into a hidden form targeting `{origin}/run?embed=1&…`, written into the iframe document |
| `openProjectId` / `openGithubProject` / `openProject` | same routes in a tab (`_blank` default) |
| `connect(iframe)` | attach the VM to an existing StackBlitz iframe |

Default origin is `https://stackblitz.com`. `origin` can be set for StackBlitz Enterprise Edition.

Embed methods replace a DOM node with an iframe (default height `300`, width `100%`), set a broad Permissions-Policy `allow` list, and return a Promise of a [`VM`](https://developer.stackblitz.com/platform/api/javascript-sdk-vm). Connection retries 20 times every 500 ms ([`src/constants.ts`](https://github.com/stackblitz/sdk/blob/main/src/constants.ts)).

New projects from `openProject` / `embedProject` **are not persisted** unless the user forks them into a StackBlitz account ([SDK](https://developer.stackblitz.com/platform/api/javascript-sdk#generate-and-embed-new-projects)).

There is also a form-POST equivalent without the SDK: POST to `https://stackblitz.com/run` with `project[title]`, `project[files][PATH]`, `project[template]`, etc. ([POST API](https://developer.stackblitz.com/platform/api/post-api)). Binary files are not supported on that path.

### 1.3 WebContainer API used from our own UI (`@webcontainer/api`)

This is a **different product**: a headless in-browser Node runtime that *we* boot, mount files into, `spawn` processes in, and attach a preview iframe to. It does not load the StackBlitz editor chrome. Docs live at [webcontainers.io](https://webcontainers.io); the StackBlitz site points there ([WebContainer API](https://developer.stackblitz.com/platform/api/webcontainer-api)).

Current npm: **`@webcontainer/api@1.6.4`**. The client library is versioned independently of the runtime hosted by StackBlitz ([API versioning](https://webcontainers.io/guides/api-support)).

Capabilities ([API reference](https://webcontainers.io/api), [Quickstart](https://webcontainers.io/guides/quickstart)):

- `WebContainer.boot({ coep, workdirName, forwardPreviewErrors })` — **only one instance** at a time; boot is expensive; `teardown()` then boot again.
- `mount(FileSystemTree | Uint8Array | ArrayBuffer)` — recommended for initial hydration. File contents may be `string | Uint8Array` (binaries are allowed here, unlike the StackBlitz SDK `Project.files`).
- `fs` (promises-style: `readFile`, `writeFile`, `mkdir`, `readdir`, `rm`, `rename`, `watch`).
- `spawn(command, args, { cwd, env, output, terminal })`.
- Events: `port`, `error`, `server-ready`, `preview-message`.
- `export()`, `setPreviewScript()` (advanced; can break WC features), `reloadPreview(iframe)`.
- `configureAPIKey(key)` **must** be called **before** `boot` for commercial usage.
- `auth.init` / `startAuthFlow` / `loggedIn` — OAuth against StackBlitz so a visitor who is logged into StackBlitz **and** belongs to the org that issued `clientId` can install **private npm packages**. Not a general “log into sveltepress.site” API.

Production pages **must be HTTPS**. `localhost` is exempt during development.

WebContainers is what StackBlitz Classic / Codeflow / Web Publisher use under the hood for Node projects ([Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments)). Using the API means **we** own UI, headers, and process lifecycle.

---

## 2. How a Starter is addressed

| Address | Form | Notes |
| --- | --- | --- |
| GitHub import URL | `https://stackblitz.com/github/{user}/{repo}` and the equivalent `…/github.com/{user}/{repo}` | Public repos. Optional `/tree/{branch\|tag\|commit}` and a **subdirectory**. GitHub remains source of truth; pushes update the import. Requires a `package.json`. ([Importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects), [Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)) |
| GitHub fork URL | `https://stackblitz.com/fork/github/{user}/{repo}` | Immediately a writable copy. Without `/fork`, the import is not writable; first save reloads into a personal copy. StackBlitz **recommends always using `/fork`** for “Open in StackBlitz” links. |
| StackBlitz project id | `https://stackblitz.com/edit/{projectId}` | Existing hosted project. SDK: `embedProjectId` / `openProjectId`. |
| Dynamic payload | POST `/run` or `sdk.embedProject` / `openProject` | In-memory until forked. Templates: EngineBlock `angular-cli`, `create-react-app`, `html`, `javascript`, `polymer`, `typescript`, `vue`; WebContainers `node`. ([SDK options](https://developer.stackblitz.com/platform/api/javascript-sdk-options#projecttemplate)) |
| Collection | Dashboard grouping with a shareable collection URL | Organizes projects; **not** an embed target. ([Collections](https://developer.stackblitz.com/guides/user-guide/collections)) |
| Monorepo folder | `?configPath=packages/docs` | Which folder’s `package.json` to use. ([Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)) |
| Title override | `?title=…` | Default title is `username/repo`. |
| `.new` / `/new` | e.g. `sveltekit.new`, `awesome-lib.com/new` | First-party recommendation is a **redirect onto** a `stackblitz.com/fork/github/…` URL, not a custom-hosted editor. ([Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github#set-up-the-main-starter-url), [Starter projects](https://developer.stackblitz.com/guides/user-guide/starter-projects)) |

**Private GitHub** import is a **paid membership** feature ([Importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects#importing-private-projects), [Membership](https://stackblitz.com/membership) / [Pricing](https://stackblitz.com/pricing)).

**`githubbox` is not a StackBlitz addressing mechanism.** First-party StackBlitz docs do not mention it. [`dferber90/githubbox`](https://github.com/dferber90/githubbox) is a CodeSandbox helper (`github.com` → `githubbox.com`). A request to `https://githubbox.com/SveltePress/sveltepress` (2026-09-14) returned `302` to `https://codesandbox.io/s/github/SveltePress/sveltepress`.

**Hard limit on `/fork/` in an iframe:** `GET https://stackblitz.com/fork/github/SveltePress/sveltepress` and the same URL with `?embed=1` both returned `x-frame-options: SAMEORIGIN` (2026-09-14). `/github/…` and `/edit/…?embed=1` did **not**. So the URL StackBlitz recommends for “Open in new tab” is **not** the URL their embed docs use for iframes. SDK `embedGithubProject` builds `/github/{slug}`, not `/fork/github/{slug}` ([`src/lib.ts`](https://github.com/stackblitz/sdk/blob/main/src/lib.ts)).

GitHub import will not run non-Node backends (PHP, Python, Java), binary DB servers (MySQL, PostgreSQL), or some incompatible npm packages ([Importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects)). Example `package.json` files must not use relative paths into a parent repo that is not imported ([Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)).

---

## 3. Embed controls

### 3.1 iframe query parameters

From [Embedding projects](https://developer.stackblitz.com/guides/integration/embedding):

| Parameter | Values | Effect |
| --- | --- | --- |
| `embed` | `0`/`1` | Force embed layout regardless of screen size |
| `ctl` | `0`/`1` | Click-to-load overlay |
| `file` | path | Default file open in the editor |
| `theme` | `light` / `dark` | Editor UI theme |
| `view` | `editor` / `preview` | Default view |
| `hideExplorer` | `0`/`1` | Hide file explorer pane in embed view |
| `hideNavigation` | `0`/`1` | Hide preview URL bar |
| `showSidebar` | `0`/`1` | Show sidebar in embed view (**large viewports only**) |
| `hidedevtools` | `0`/`1` | Hide console (EngineBlock) |
| `devtoolsheight` | `0`–`100` | Console height (EngineBlock) |
| `terminalHeight` | `0`–`100` | Terminal height (WebContainers) |
| `startScript` | string | npm script(s) to run on load (WebContainers) |
| `initialpath` | URI-encoded path | **Preview** initial URL path |

SDK option names map onto these (e.g. `openFile` → `file`, `clickToLoad` → `ctl`, `forceEmbedLayout` → `embed`, `crossOriginIsolated` → `corp=1`) ([`src/params.ts`](https://github.com/stackblitz/sdk/blob/main/src/params.ts)).

### 3.2 SDK `EmbedOptions` / `OpenOptions`

Documented in [SDK options](https://developer.stackblitz.com/platform/api/javascript-sdk-options); types in [`src/interfaces.ts`](https://github.com/stackblitz/sdk/blob/main/src/interfaces.ts) (v1.11.1). Extra vs the HTML table:

- `height` (default `300`), `width` (default `100%`) — embed only.
- `openFile`: string or string[] — tabs vs split panes; `{path}:L{n}` and `{path}:L{start}-L{end}` line highlight (highlight clears on edit).
- `sidebarView`: `project` \| `search` \| `ports` (WC) \| `settings` (since 1.9.0).
- `startScript`: comma-separated **keys of `package.json` `scripts`**, not arbitrary shell (since 1.9.0).
- `organization: { provider: 'github', name }` (since 1.10.0).
- `crossOriginIsolated` (since 1.11.0): set `corp=1` and delegate `allow="cross-origin-isolated {origin}"`.
- `origin`: EE instance.
- `zenMode`: **open** (tab) only, since 1.9.0.
- `forceEmbedLayout`: deprecated; embed methods still force `embed=1`.
- `hideExplorer` hides the **ActivityBar** (sidebar icons), not only the file tree ([options](https://developer.stackblitz.com/platform/api/javascript-sdk-options) vs [IDE anatomy](https://developer.stackblitz.com/guides/user-guide/ide-whats-on-your-screen)).

`view` is an **intent**, not a guarantee ([UiViewOption](https://developer.stackblitz.com/platform/api/javascript-sdk-options#uiviewoption)):

- `'default'`: preview + editor on large viewports; **editor only on small viewports**.
- `'preview'`: preview only, **embed layout only**.
- `'editor'`: editor only.

Theme: `'default'` currently means `'dark'`; `'light'` and `'dark'` are the two built-ins.

Terminal vs console: **WebContainers have a terminal, not a console; EngineBlock has a console, not a terminal** ([Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments)). `terminalHeight` default `30` (WC). `0`/`100` may clamp to min/max rather than literally hide/fill ([interfaces](https://github.com/stackblitz/sdk/blob/main/src/interfaces.ts)). Keyboard `Ctrl/Cmd + \`` toggles the terminal ([FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs)).

### 3.3 VM (after embed)

Only for **embedded** projects ([VM docs](https://developer.stackblitz.com/platform/api/javascript-sdk-vm)):

- Files: `applyFsDiff({ create, destroy })` (full file rewrite), `getFsSnapshot()`, `getDependencies()`.
- Editor: `openFile`, `setCurrentFile` (experimental; will not open a new tab), `setTheme`, `setView`, `showSidebar`.
- Preview: `getUrl()` / `setUrl('/path')` (path **must** start with `/`; cannot change origin). On WebContainers, `preview.origin` is always `null`; `getUrl()` is `null` until a server is up; `setUrl` is **ignored** if no server is running.

`applyFsDiff` is how a host page would rewrite `src/routes/foo/+page.md` after load. There is **no** documented VM method to freeze the editor or mark the filesystem read-only.

### 3.4 Editable vs read-only

First-party docs do **not** expose an embed `readonly=1` (or equivalent) flag.

What they *do* say:

- GitHub import **without** `/fork` is not writable; save creates a fork ([Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github#open-directly-or-fork)).
- Dynamic SDK projects live in memory until the user forks ([SDK](https://developer.stackblitz.com/platform/api/javascript-sdk#generate-and-embed-new-projects)).
- Teams projects can have a **viewer** default role inside a team workspace ([Collaboration and access control](https://developer.stackblitz.com/teams/collaboration-and-access-control)) — that is a Teams sharing control, not an embed query param.
- VM `applyFsDiff` and the in-iframe editor both write files.

So a public docs embed is **editable in the iframe**. Persistence of those edits is a later product question (fork + GitHub login).

### 3.5 SDK vs iframe gap: `initialpath`

The iframe docs and the create-with-SDK guide document `initialpath` / `initialPath` for the **preview** URL ([embedding](https://developer.stackblitz.com/guides/integration/embedding), [create with SDK](https://developer.stackblitz.com/guides/integration/create-with-sdk)). `@stackblitz/sdk` `ParamName` includes `initialpath`, but **`generators` does not emit it**, and `EmbedOptions` in `src/interfaces.ts` has no `initialPath`. A catalog that needs a preview path on an SDK-created iframe must put `initialpath` on a **hand-built URL**, or call `vm.preview.setUrl` after the server is up.

---

## 4. Hard limits

### 4.1 iframe, CSP, cookies, COEP/COOP

Two different isolation stories:

**A. Hosted StackBlitz embed (iframe to `stackblitz.com`)**

- Isolation for WebContainers runs **inside** StackBlitz’s origin. The parent docs page is not required (by StackBlitz docs) to send COOP/COEP.
- Embed responses observed 2026-09-14: no CSP header, no `X-Frame-Options` on `/edit/…?embed=1` and `/github/…`; `X-Frame-Options: SAMEORIGIN` on `/fork/github/…`.
- Session cookies are `SameSite=None; Secure` so third-party cookie context can keep a guest session. **Third-party cookie / storage blockers break WebContainers** because each project installs a Service Worker on `*.stackblitz.io` / `*.webcontainer.io` / `*.webcontainer-api.io` ([Browser config](https://developer.stackblitz.com/platform/webcontainers/browser-config), [WC troubleshooting](https://webcontainers.io/guides/troubleshooting)). Brave Shields, Chrome “Block third-party cookies”, Firefox “All cross-site cookies”, Edge “Strict” enhanced security are documented failure modes.
- StackBlitz.com currently ships an Origin-Trial header for `UnrestrictedSharedArrayBuffer` on `https://stackblitz.com` (observed 2026-09-14; expiry in the token is 1779148800). That is their page, not ours.

**B. WebContainer API on sveltepress.site**

- The **docs origin** must be cross-origin isolated ([Configuring headers](https://webcontainers.io/guides/configuring-headers), [Quickstart](https://webcontainers.io/guides/quickstart)):

  ```
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  ```

  Alternative: `COEP: credentialless` plus `WebContainer.boot({ coep: 'credentialless' })`. `coep: 'none'` is Chromium Origin-Trial only and is fixed after first boot.
- Netlify recipe is a `netlify.toml` `[[headers]]` block (all pages or a path). SvelteKit recipe is `hooks.server.js` / `+page.server.js` `setHeaders`. **This repo currently does neither.** `adapter-static` + prerender means production headers have to come from Netlify (`netlify.toml` / `_headers`), not from a Node server hook.
- Cached `304` responses **without** those headers produce `SharedArrayBuffer transfer requires self.crossOriginIsolated` ([Troubleshooting](https://webcontainers.io/guides/troubleshooting)).
- Embedding a COI page in another COI page: **both** must use the same COEP (`require-corp`), and the iframe needs `allow="cross-origin-isolated"`.
- SDK `crossOriginIsolated: true` is for **StackBlitz-hosted** embeds that need isolation delegated into the iframe; it does not isolate sveltepress.site.

`Content-Security-Policy` for embedding StackBlitz is **not documented**. Parent-page CSP would be ours; first-party docs do not list required `frame-src` hosts. Runtime assets observed on editor responses include `c.staticblitz.com`, `v-corp.staticblitz.com`, `w-staticblitz.com`. Browser-config exceptions use `stackblitz.com`, `*.stackblitz.io`, `*.webcontainer.io`, `*.webcontainer-api.io`, `*.staticblitz.com`.

### 4.2 Custom domain

- Public product: editor and embeds live on `stackblitz.com`. `.new` domains are **redirects** onto StackBlitz URLs ([Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github#set-up-the-main-starter-url)).
- Hosting the editor on **our** hostname is an **Enterprise Server** feature: admin-console **DNS Zone** + **TLS** ([Administrator guide](https://developer.stackblitz.com/enterprise/installation/administrator-guide), [Enterprise overview](https://developer.stackblitz.com/enterprise/overview), [stackblitz.com/enterprise](https://stackblitz.com/enterprise)).
- SDK `origin` points embeds at an EE instance ([EmbedOptions](https://developer.stackblitz.com/platform/api/javascript-sdk-options#embedoptions)).
- WebContainer API still talks to StackBlitz-hosted runtime even when the UI is ours ([API versioning](https://webcontainers.io/guides/api-support)). Self-hosted WC API is an enterprise/commercial offering ([Commercial usage](https://webcontainers.io/enterprise)).

### 4.3 Offline

StackBlitz marketing copy: the IDE “works online and offline”; “continue your work even when you lose the Internet connection midway” ([What is StackBlitz?](https://developer.stackblitz.com/guides/user-guide/what-is-stackblitz)). WebContainer API lists “Works offline” vs cloud VMs ([Introduction](https://webcontainers.io/guides/introduction)).

Hard limits around that claim:

- First load still fetches editor / `@webcontainer/api` runtime from StackBlitz.
- Production WC pages must be HTTPS ([Quickstart](https://webcontainers.io/guides/quickstart)).
- GitHub import, npm install, and private-package auth need network.
- No first-party guarantee that a **cold** iframe embed on sveltepress.site works with no network.

### 4.4 Node version pinning

**Not offered as a supported control.**

- FAQ, Codeflow: “The current state of Codeflow does not support users being able to set their own Node version.” ([FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs))
- [Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config) (`package.json#stackblitz` / `.stackblitzrc`) has `installDependencies`, `startCommand`, `compileTrigger`, `env` — **no Node version field**.
- `WebContainer.boot` options have **no** Node version ([API](https://webcontainers.io/api)).
- Roadmap (explicitly “subject to change”, may be outdated): **Node 18 shipped**; **Node 20 in development**; **supporting multiple Node.js versions** is **Future** ([Roadmap](https://developer.stackblitz.com/platform/webcontainers/roadmap), issue [webcontainer-core#560](https://github.com/stackblitz/webcontainer-core/issues/560)).

TypeScript version on EngineBlock starters is also fixed; WC projects can `npm install` any TypeScript ([FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs)).

### 4.5 Other runtime limits (Node / SveltePress-shaped starters)

From [Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments), [FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs), [WC troubleshooting](https://webcontainers.io/guides/troubleshooting), [StackBlitz WC troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers):

- A SveltePress starter needs **WebContainers** (`template: 'node'` or a GitHub repo with Node scripts). EngineBlock cannot run a Node/Vite/SvelteKit toolchain or a terminal.
- WebContainers package managers: npm, pnpm, yarn v1. Keep `package-lock.json` (or equivalent) for boot speed.
- Native addons are disabled (`--no-addons`). C++ addons fail unless compiled to WASM.
- Cannot install a **custom Service Worker**; WC uses its own as the network stack.
- Direct TCP databases (Mongo/Postgres/MySQL) are not supported; API-based DBs (e.g. Neon) are suggested instead.
- Electron / native apps: not supported (browser-only).
- One WC instance per page; many simultaneous StackBlitz embeds can OOM (`WebAssembly.instantiate(): Out of memory`).
- Shareable preview URL: EngineBlock yes, WebContainers **no**.
- SDK `Project.files` is **text only** (no binary/archive/bitmap). WC `FileSystemTree` allows `Uint8Array`. SDK POST encodes `[` `]` in paths as `%5B` `%5D` so SvelteKit `+page` routes are representable ([`src/generate.ts`](https://github.com/stackblitz/sdk/blob/main/src/generate.ts)).
- `startScript` only accepts existing `package.json` script names; arbitrary commands need `.stackblitzrc` `startCommand`. Default autostart looks for `dev`, then `start`.
- Firefox Private Browsing cannot run a WC web server (no Service Worker). Firefox/Safari preview-in-iframe third-party assets may be blocked; workaround is open preview in a new window ([Browser support](https://developer.stackblitz.com/platform/webcontainers/browser-support)).
- Browser support (docs last updated February 2023): full on desktop Chromium; beta Firefox, Safari 16.4+, Android; iOS 16.4+ beta with memory limits.

---

## 5. Auth, quotas, pricing, branding (OSS documentation site)

### 5.1 Auth

- **Viewing / editing public projects** does not require a GitHub account. **Saving or collaborating does.** ([Pricing FAQ](https://stackblitz.com/pricing))
- Sign-in is GitHub (Personal plan: “sign in with your GitHub account”) ([FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs)).
- StackBlitz GitHub App (since 2023-09-27) is per-repository, not all-or-nothing OAuth ([FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs)).
- Embeds set guest/`_stackblitz_session` cookies. Fork-to-save will prompt login inside the iframe.
- WebContainer `auth.*` is **org-scoped OAuth for private npm**, not docs-site SSO ([API](https://webcontainers.io/api)).
- Enterprise: SAML2 SSO ([Enterprise](https://stackblitz.com/enterprise)).

### 5.2 Plans and quotas

From [Pricing](https://stackblitz.com/pricing) FAQ copy, [FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs), [Teams](https://developer.stackblitz.com/teams/what-is-stackblitz-teams):

| Plan | First-party statement |
| --- | --- |
| Personal (free) | Unlimited **public** StackBlitz projects, collections, and GitHub repositories. Classic + Codeflow for public work. |
| Personal+ | Unlimited **private** projects, unlimited file uploads, Codeflow for private repos. |
| Teams | GitHub-org workspace; mix free (public-only) and paid (private) seats; 14-day trial mentioned in Teams docs. Public projects remain shareable outside the team. |
| Enterprise Server | Self-hosted Kubernetes; contact sales. Custom domain, private npm, SSO. |

**No numeric embed quota, rate limit, or “N iframes per page” appears in the developer embed docs or the pricing FAQ copy.** The TOS incorporate the Pricing Page and developer documentation as the usage limits ([Terms §1.4, §1.5](https://stackblitz.com/terms-of-service)). Practical limit documented on the WC side is **browser memory** if many embeds run at once ([Troubleshooting](https://webcontainers.io/guides/troubleshooting)).

Private GitHub import = membership ([Importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects)).

### 5.3 SDK / embed license (OSS docs)

[Terms of Service](https://stackblitz.com/terms-of-service) §1.5 (published 2026-09-14):

- **(a) Hyperlinks:** anyone may link to the Sites or a public project, provided the link does not misrepresent the relationship with StackBlitz or use Licensor Marks except as permitted by StackBlitz’s brand guidelines.
- **(b) SDK and Embedding:** non-exclusive, non-transferable, **revocable** license to integrate the SDK and **embed the StackBlitz editor in your own websites and applications**, on the plans and within the usage limits identified on the Pricing Page or in the developer documentation.
- **(c) WebContainer API:** subject to license tiers, session limits, and other limits in webcontainers.io docs and the Pricing Page. **Production or commercial use, or use beyond stated limits, requires an active plan or separate written license.** Contact `hello@stackblitz.com`.
- **(d)** Those rights last only while the plan/license is active.

SDK/embed content used solely through StackBlitz (not Bolt) is **not** Bolt Model Development Content and is not used for the Bolt training/dataset licenses in §3.5.

There is **no published dollar price for embedding public projects on an OSS docs site** on the Pricing FAQ. Personal = unlimited public projects.

### 5.4 WebContainer API license (if we boot WC ourselves)

- Intro: “Always free for Open Source” ([Introduction](https://webcontainers.io/guides/introduction)).
- [Commercial usage](https://webcontainers.io/enterprise): license required for **production usage in a commercial, for-profit setting**. Prototypes/POCs do not. Violation of TOS may revoke access.
- FAQs (developer.stackblitz.com): free for most users; “high levels of commercial usage” billed nominally beyond **10,000 API requests per month**; sales form ([FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs)).
- `configureAPIKey` exists for commercial usage ([API](https://webcontainers.io/api)).
- Enterprise WC: self-hosted / VPC, private npm, SAML, priority support.

An OSS documentation site embedding **hosted** StackBlitz is §1.5(b). An OSS site **booting `@webcontainer/api` on sveltepress.site** is the WC license (OSS-free per intro; commercial terms if the project were for-profit).

### 5.5 Branding

Documented, first-party:

- Official **Open in StackBlitz** SVG buttons, hostable from `https://developer.stackblitz.com/img/open_in_stackblitz.svg` (and `_small`) ([Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)).
- Embed UI includes the StackBlitz **logo in the Menu Bar** (links to dashboard or homepage) ([IDE: what’s on your screen](https://developer.stackblitz.com/guides/user-guide/ide-whats-on-your-screen)). `hideExplorer` / `hideNavigation` / `view=preview` hide chrome but **no documented flag removes the logo or rebrands the iframe**.
- TOS §1.5(a): Licensor Marks only per brand guidelines. `https://stackblitz.com/brand` and `https://developer.stackblitz.com/brand` returned **404** on 2026-09-14; the TOS still refer to “brand guidelines.” Footer on stackblitz.com: “StackBlitz Codeflow and the Infinite Pull Request logo are trademarks of StackBlitz, Inc.”
- TOS §8.9 publicity (name/logo in customer lists) applies to **Teams/Enterprise/organizational plans**, with opt-out — not to a free Personal OSS embed.
- White-label / custom starters on the **dashboard** are **Enterprise Edition only** ([EE starter projects](https://developer.stackblitz.com/enterprise/starter-projects)).

No first-party “you must display our badge on every embed” sentence was found beyond the chrome the editor itself renders and the hyperlink/mark rules in the TOS.

---

## 6. Can a catalog page deep-link into a path inside the project?

**Editor file path (`src/routes/foo/+page.md`): yes, as an embed/open query (or SDK `openFile` / `vm.editor.openFile`).**

- iframe: `?file=src/routes/foo/%2Bpage.md` (or unencoded `+` depending on URL construction). Format also supports `:L12` / `:L5-L10` ([embedding](https://developer.stackblitz.com/guides/integration/embedding), [OpenFileOption](https://developer.stackblitz.com/platform/api/javascript-sdk-options#openfileoption)).
- SDK: `openFile: 'src/routes/foo/+page.md'` (and split panes / multi-tabs). Dynamic `embedProject` encodes `[]` in paths; `+` is a normal path character.
- After load: `vm.editor.openFile('src/routes/foo/+page.md')`.

That is a **file in the editor**, not a SvelteKit route.

**Preview URL path (`/foo` as served by the running app): partially.**

- iframe query `initialpath` (URI-encoded) sets the preview’s initial path ([embedding](https://developer.stackblitz.com/guides/integration/embedding)).
- VM: `vm.preview.setUrl('/foo')` after a server is listening; ignored before that on WebContainers ([VM](https://developer.stackblitz.com/platform/api/javascript-sdk-vm)).
- SDK currently **does not generate** `initialpath` (see §3.5).

**GitHub `/tree/.../src/routes/foo` is a different meaning:** it imports that **directory as the project root**, it does not open a file inside a larger repo ([Open from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)).

**Collections** have a share URL for a **list of projects**, not a deep link into a file ([Collections](https://developer.stackblitz.com/guides/user-guide/collections)).

There is no first-party “catalog API.” A Feature directory on sveltepress.site would be **our** pages that link/embed StackBlitz URLs with `file` / `initialpath` / SDK options.

---

## 7. Implications for this host (facts, not a design)

Recorded so later tickets do not rediscover the collision with *this* site:

- `packages/docs-site` is static on Netlify. Booting `@webcontainer/api` on a Playground route requires adding COOP/COEP (likely `netlify.toml` headers) for those routes. That header pair is a **site-wide behavior change** if applied to `/*` (breaks some third-party embeds, cross-origin resources without CORP). Path-scoped headers are documented by WebContainers.
- Hosted `stackblitz.com` iframes do **not** require those headers on sveltepress.site.
- Theme `sm` = `950px`. StackBlitz `view=default` already drops the preview on small viewports. Any in-article iframe at default height `300` will be tight next to sidebar chrome; that is layout, not an API gap.
- Locales `/`, `/zh/`, `/bn/` must stay in parity for any later user-facing Playground UI. This research file is English-only on purpose.

---

## Facts later tickets may treat as true

1. There are three integration surfaces: **iframe URL to stackblitz.com**, **`@stackblitz/sdk` (v1.11.1) controlling that iframe**, and **`@webcontainer/api` (v1.6.4) booted in our own UI**. The first two are the hosted Classic Editor; the third is headless Node with no StackBlitz editor chrome.
2. A SveltePress Starter is a **WebContainers** (`node`) workload. EngineBlock cannot run it.
3. Public GitHub addressing is first-class: `stackblitz.com/github/{user}/{repo}[/tree/{ref}/subpath]`, optional `?configPath=`, `?startScript=`, `?title=`. SDK `embedGithubProject` / `openGithubProject` wrap that.
4. `/fork/github/…` is the recommended **new-tab** writable URL and is **not iframe-friendly** (`X-Frame-Options: SAMEORIGIN` observed). Embeds use `/github/…` or `/edit/{id}` with `embed=1`.
5. `githubbox.com` is CodeSandbox, not StackBlitz.
6. Collections group projects; they are not embed addresses.
7. Embed controls exist for theme (`light`/`dark`), view (`editor`/`preview`/`default`), click-to-load, hiding explorer/navigation/console, terminal height (WC), console height (EngineBlock), opening files (including line ranges and split panes), start script, and (iframe-only / VM) preview path. `view=default` is **editor-only below large viewports**.
8. There is **no documented read-only embed flag**. GitHub-without-fork is read-only until save-forks. VM and the iframe editor can write files.
9. Catalog deep-link to `src/routes/foo/+page.md` is `file=` / `openFile` / `vm.editor.openFile`. Deep-link to the **running preview path** is `initialpath` or `vm.preview.setUrl('/')…`. SDK does not emit `initialpath`.
10. Hosted embeds do **not** require COOP/COEP on sveltepress.site. **WebContainer API does**, including on Netlify, and current `netlify.toml` does not set them.
11. Third-party cookie / storage blocking breaks WebContainers (Service Workers on `*.webcontainer.io` etc.).
12. Custom editor domain is Enterprise. Public `.new` links are redirects onto stackblitz.com.
13. **Node version is not pin-able** via documented project config, URL, SDK, or `WebContainer.boot`. Roadmap still lists multiple Node versions as future.
14. Native addons, custom Service Workers, TCP databases, EngineBlock Node, and binary SDK `Project.files` are hard no’s. WC `mount` accepts binary `Uint8Array`.
15. One WC instance per page; many live embeds can OOM.
16. Free Personal plan: unlimited **public** projects/collections/GitHub repos. GitHub login required to **save**. Private GitHub import is paid. TOS grants a revocable license to embed the editor/SDK on our sites within pricing-page / docs limits; no numeric embed quota is published there.
17. WebContainer API is documented as free for open source; commercial production use needs a license / API key (FAQ mentions 10k requests/month as the commercial threshold).
18. Embeds show StackBlitz menu-bar branding. Official “Open in StackBlitz” SVGs are provided. No public brand-guidelines page was found (404); TOS still require marks to follow those guidelines and forbid misrepresentation.
19. Offline-after-boot is claimed for WC compute; cold embed/install/GitHub still need network; production WC must be HTTPS.
20. Dynamic `embedProject` projects are ephemeral until the visitor forks (GitHub account).
