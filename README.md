# Syed Waleed Ahmed -- Portfolio

[![CI](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.13-brightgreen.svg)](.nvmrc)
[![Live](https://img.shields.io/badge/live-syedwaleedahmed.me-0a7cff.svg)](https://syedwaleedahmed.me/)

A modern, responsive **personal portfolio website** built with **React 19 + Vite** on the frontend and **Node.js + Express** on the backend.
Designed with a focus on **performance**, **accessibility**, **security**, and **clean UI/UX**.

**Live:** https://syedwaleedahmed.me/

---

## Highlights

- **Lean bundle** -- no animation library, no PWA shell, no Bootstrap JS. ~10 KB CSS gzipped, ~70 KB JS gzipped after code-splitting
- **Fast build & delivery** -- Vite, code-splitting, sections code-split and mounted on `requestIdleCallback` after first paint
- **Modern UI** -- flat navy surfaces, gradient accent on headings, subject icons on skill groups, top-of-page scroll progress bar
- **Hand-rolled animations** -- vanilla `IntersectionObserver` reveal hook + CSS keyframes (no `framer-motion`, no `tsparticles`)
- **Custom navbar** -- own collapse logic, no Bootstrap JS dependency
- **Accessibility** -- skip-to-content link, focus-visible rings, semantic landmarks, `prefers-reduced-motion` honored
- **Custom 404 page** -- branded standalone page Netlify auto-serves on missing routes
- **Fully responsive** -- desktop, tablet, mobile (375px+ baseline)
- **Hardened backend** -- Helmet security headers, `express-rate-limit`, body-size cap, trust-proxy, graceful shutdown
- **Automated tests** -- 9 backend API tests via Node's built-in runner (`npm test`, no extra deps); importing the app also verifies every module loads
- **API test suite** -- Postman collection with happy-path + validation + body-cap + rate-limit + 404 tests (see [`postman/`](postman/))
- **CI/CD** -- GitHub Actions runs lint, build, backend tests, `npm audit`, and gitleaks secret scan on every push and PR
- **Auto dependency updates** -- Dependabot opens grouped weekly PRs: minor + patch for npm (majors are manual), and *all* updates for GitHub Actions, majors included
- **Pinned Node version** -- `.nvmrc` is the single source of truth; CI reads it via `node-version-file`, and `netlify.toml` + `engines` are kept in step
- **SEO-ready** -- canonical URL, `Person` + `WebSite` + `ProfilePage` JSON-LD schemas, OG + Twitter cards, `noscript` fallback, sitemap (+image), robots.txt, humans.txt
- **Content Security Policy** -- Netlify `_headers` with a hash-pinned CSP and friends
- **Analytics** -- GA4, loaded from an inline snippet deferred to `requestIdleCallback` so it never blocks first paint
- **Print-friendly** -- dedicated print stylesheet
- **Custom domain + HTTPS** -- syedwaleedahmed.me
- **Data-driven architecture** -- portfolio content lives in `src/data/`, components are pure UI
- **Error boundary** -- graceful crash recovery for below-fold sections

---

## Sections

| Section | Description |
|---------|-------------|
| Hero | Portrait, animated intro, headline with blinking caret, lead copy, outlined CTAs + resume + LinkedIn / GitHub icon links |
| About | Approach copy, a stat band aggregating figures already claimed elsewhere, and the education timeline |
| Experience | Work history cards (MemorAIz thesis internship, Fruugle internship, Jubilee trainee) |
| Projects | AI/ML and robotics projects with role/period meta, an insight block, tech tags and GitHub links; the thesis card is marked `featured` |
| Skills | Bento-style tag groups across AI/LLM Engineering, ML & Data Science, Languages, Web & Backend, Databases & Messaging, Cloud & DevOps, each with a subject icon |
| Interests | Three role cards, a principle strip, and a grid of icon topic tiles |
| Contact | Contact form (name, email, subject, message) with an auto-growing message field, and email delivery via Resend |

---

## Design

Every colour is a token in `:root` (`frontend/src/styles/base.css`). The page
background is flat top to bottom -- no gradients, no glows -- and cards are
defined purely by sitting a shade lighter than it.

| Token | Value | Use |
|-------|-------|-----|
| `--bg-main` | `#0a192f` | Page background, uniform throughout |
| `--bg-card` | `#112240` | Raised blocks -- cards, panels, inputs |
| `--bg-card-hover` | `#233554` | Card hover |
| `--accent` | `#6366f1` | Indigo -- gradient start, timeline dots |
| `--accent-2` | `#22d3ee` | Cyan -- outlined CTAs, card headings, focus |
| `--gradient-accent` | indigo → cyan | Accented type, logo mark, progress bar |

Two rules keep it consistent:

1. **Translucent surfaces compose from the palette**, never from a separate
   hardcoded colour: `rgba(var(--light-navy-rgb), 0.5)`, not `rgba(15, 23, 42, 0.5)`.
   `--navy-rgb` / `--light-navy-rgb` hold the raw triplets for exactly this.
2. **Two files inline the palette by hand** and can't read the tokens, so they
   need updating in step:
   - `frontend/public/404.html` -- standalone page, no bundled CSS
   - `frontend/public/apple-touch-icon.png` -- `--bg-main` is baked in, since
     iOS composites transparent icons onto white

`<meta name="theme-color">` in `index.html` and `404.html` also tracks `--bg-main`.

### Typography

**NTR** (self-hosted, latin subset only, ~12 KB) with a `system-ui` fallback.
It's served from `public/fonts/` rather than Google Fonts, so `font-src` stays
at `'self' data:` and there's no third-party request on the critical path.
`index.html` preloads it, since the hero headline would otherwise flash the
fallback under `font-display: swap`.

`404.html` redeclares the same `@font-face` because it can't reach the bundled
CSS -- it points at the same file, so there's still one copy.

**NTR ships a single 400 weight.** Anything heavier (`fw-bold`, `.hero-title
.gradient-text`, headings) is synthesised by the browser rather than a real
bold cut.

A second `@font-face` (`NTR Fallback`) exists purely to stop layout shift.
Because every size is tuned to NTR's small x-height, the fallback that paints
first under `font-display: swap` would draw them ~20% too large and reflow the
page on swap. `size-adjust: 79.8%` matches the fallback to NTR's x-height --
the best single fit across Segoe UI, SF, Roboto and Arial -- leaving under 3%
residual. If no `local()` matches, the face is skipped and the stack falls
through to plain `system-ui`.

#### Why the font sizes look large

NTR's x-height is **0.412 em** against ~0.50 for Segoe UI and system-ui
generally, so it renders roughly **20% smaller** than those at the same
`font-size`. Every text size is therefore scaled **1.2x** from a
system-font-normalised baseline: body copy is `1.26rem` (~20px), the hero
headline tops out at `5rem` (80px). Those land on the same optical size the
old system-font stack produced, and independently match what the reference
design uses with the same face.

If the typeface ever changes, rescale by the x-height ratio rather than
copying these numbers across.

**`font-size` on icon containers is not part of that scale.** `react-icons`
renders SVGs sized in `em`, so `font-size` there controls a glyph, not NTR
text - `.btn-outlined--icon`, `.card-heading-icon`, `.project-link-icon`,
`.btn-icon`, `.contact-label-icon` and `.scroll-top-btn` stay at their
unscaled values.

### Generated assets

Three binaries in `public/` are generated rather than hand-drawn, so they need
regenerating rather than editing:

| Asset | Source | How |
|-------|--------|-----|
| `images/og-card.png` | `images/Profile.avif` + `fonts/ntr-latin-400.woff2` | `npm i --no-save sharp fontkit && node scripts/gen-og-card.mjs` |
| `images/Profile.{avif,webp}` | 680x680 (2x the 340px hero slot), square-cropped from the 1908x2392 original | re-crop from the original if the photo changes |
| `favicon.*`, `apple-touch-icon.png` | `favicon.svg` | rasterised from the SVG; the touch icon bakes in `--bg-main` |

`gen-og-card.mjs` reads only files already in the repo, so the card is
reproducible from a clean checkout. It renders text as vector paths rather than
`<text>`, so it doesn't need NTR installed as a system font - which would
otherwise silently substitute a fallback and produce a card in the wrong
typeface. It throws rather than emitting a card with text running off the edge.

`sharp` and `fontkit` are installed on demand, not kept in `package.json`:
sharp ships ~30 MB of native binaries and CI has no reason to pull that in to
lint and build a static site.

### Buttons

There is **one** button, `.btn-outlined` in `base.css`, with two modifiers:
`--accent` (the primary action in a group) and `--icon` (icon-only square).
Hero CTAs, the contact submit and the error-boundary retry all render from it,
so they cannot drift apart. Nothing on the site is a filled button.

Anything tappable gets a 48x48 floor under `@media (pointer: coarse)` - keyed
to the input device rather than a width breakpoint, and set on the elements
themselves, since the audit measures each element's own client rect (an
expanded `::after` would not count).

### Project cards line up on shared rows

Projects is the one section that does **not** use Bootstrap columns. It is a
CSS grid (`.projects-grid`), and each card spans three shared row bands -
body, insight, stack - via `grid-template-rows: subgrid`. That is what keeps
the insight block and the tag row on the same line across a row however long
the description above them runs; with plain flex cards, each one sized itself
and the insight block floated to wherever its own text ended.

Three things about it are load-bearing:

1. **The card's padding lives in `components.css`, not in a `p-4` utility.**
   A subgrid's box has to be described alongside its track rules. Dropping it
   renders the title clipped against the card edge.
2. **`row-gap` on `.projects-grid` is the only vertical rhythm value.** It is
   both the space between cards and the space between the three bands inside
   one, so per-block margins can't drift apart. Don't reintroduce `mb-*`
   utilities on the three children.
3. **The markup nests two subgrids** - `Reveal` renders the grid item
   (`.project-cell`), the card sits inside it - and both declare
   `grid-row: span 3`. Adding a wrapper between them breaks the chain, since
   subgrid only inherits from a direct parent.

`subgrid` is unsupported on Chrome below 117 and Samsung Internet, where the
cards fall back to ordinary stacked blocks: content still reads top to bottom,
it just stops lining up. That fallback is the reason the layout carries no
fixed heights.

The same indigo -> cyan 2px top rule marks the centrepiece in two places - the
`featured` project card and the Interests role cards - so "this one matters" is
a system signal rather than a per-section flourish.

---

## Tech Stack

### Frontend
- React 19, Vite 8, Bootstrap 5 (CSS only -- no Bootstrap JS)
- CSS Grid + `subgrid` for the Projects card alignment; Bootstrap columns everywhere else
- `react-icons` for the icon set
- Vanilla `IntersectionObserver` for scroll-reveal -- no animation library
- CSS keyframes for the hero entrance and the headline caret blink
- AVIF / WebP profile image with `<picture>` + `fetchpriority="high"`
- PurgeCSS in production trims unused Bootstrap utilities to ~9 KB gzipped

### Backend
- Node.js 24, Express 4 (ESM)
- **Layered structure**: `config/` (env parsing + validation) → `routes/` (validation + rate limit) → `services/` (Resend delivery + email template), so `server.js` stays thin
- Resend for transactional email, with a branded HTML + plain-text template
- **Security**: Helmet (CSP / X-Frame-Options / no-sniff / etc.), `express-rate-limit` (5 req / 15 min / IP), 16 KB JSON body cap, trust-proxy=1, silent CORS reject (no leaky 500s), centralized error handler, graceful SIGTERM shutdown

### Deployment
- Frontend: **Netlify** (syedwaleedahmed.me) -- `netlify.toml` pins `NODE_VERSION=24`
- Backend: **Render**

### CI / CD
- **GitHub Actions** (`.github/workflows/ci.yml`):
  - Frontend job: `npm ci` -> `eslint` -> `vite build` -> `npm audit --omit=dev --audit-level=high`
  - Backend job: `npm ci` -> `npm test` (Node's built-in runner; also proves every module imports cleanly) -> `npm audit --omit=dev --audit-level=high`
  - Secret-scan job: `gitleaks` over full git history
  - Concurrency-cancelled to avoid stale runs
  - `permissions: contents: read` at workflow level (least privilege)
  - Node comes from `node-version-file: .nvmrc`, never a hardcoded number, so CI can't drift from local
  - The build runs with `NODE_ENV=production`. That's load-bearing: `postcss.config.js` gates PurgeCSS on it, so without it the CSS ships all of Bootstrap
- **Dependabot** (`.github/dependabot.yml`): grouped weekly PRs for `frontend/`, `backend/` and GitHub Actions.
  - **npm**: minor + patch only. A major can break the app and deserves a manual read of the changelog.
  - **GitHub Actions**: majors *included*, grouped into one PR. An Action's major is how it ships a new runner or drops a deprecated input -- it's the update you most need. Ignoring them is what previously left `checkout`/`setup-node` three majors behind and `gitleaks-action` two.

---

## Project Structure

```
portfolio/
+-- .github/
|   +-- workflows/
|   |   +-- ci.yml                        # Lint + build + test + audit + gitleaks
|   +-- dependabot.yml                    # Auto-PRs for npm + actions
|   +-- PULL_REQUEST_TEMPLATE.md          # PR checklist
+-- frontend/
|   +-- public/
|   |   +-- fonts/
|   |   |   +-- ntr-latin-400.woff2       # Self-hosted body font (see Design section)
|   |   +-- images/
|   |   |   +-- Profile.avif             # 680x680, 2x the 340px hero slot
|   |   |   +-- Profile.webp
|   |   |   +-- og-card.png              # 1200x630 social card (og:image / twitter:image)
|   |   +-- _headers                      # Netlify security headers (CSP, X-Frame-Options, ...)
|   |   +-- 404.html                      # Branded 404 page Netlify auto-serves
|   |   +-- sw.js                         # Kill-switch service worker (see Caching section)
|   |   +-- humans.txt                    # Authorship + tech-stack signal
|   |   +-- apple-touch-icon.png
|   |   +-- favicon.ico
|   |   +-- favicon-96x96.png
|   |   +-- favicon.svg
|   |   +-- googleb4ba9f6faa31c433.html   # Google Search Console verification
|   |   +-- sitemap.xml
|   |   +-- robots.txt
|   +-- src/
|   |   +-- data/                         # Portfolio content -- edit here to update site
|   |   |   +-- portfolio.js              # Name, resume + social links, nav/section ids
|   |   |   +-- about.js                  # Approach copy, stat band, education timeline
|   |   |   +-- experience.js
|   |   |   +-- projects.js               # `featured: true` marks the centrepiece card
|   |   |   +-- skills.js
|   |   |   +-- interests.js              # Roles, principles, exploring topics
|   |   +-- styles/                       # Modular CSS (all stylesheets live here)
|   |   |   +-- reset.css                  # Minimal CSS reset (imported first)
|   |   |   +-- base.css
|   |   |   +-- navbar.css
|   |   |   +-- hero.css
|   |   |   +-- components.css
|   |   +-- components/
|   |   |   +-- layout/                   # App chrome (header / footer)
|   |   |   |   +-- Navbar.jsx
|   |   |   |   +-- Footer.jsx
|   |   |   +-- sections/                 # One file per page section
|   |   |   |   +-- Hero.jsx
|   |   |   |   +-- About.jsx
|   |   |   |   +-- Experience.jsx
|   |   |   |   +-- Projects.jsx
|   |   |   |   +-- Skills.jsx
|   |   |   |   +-- Interests.jsx
|   |   |   |   +-- Contact.jsx
|   |   |   +-- ui/                       # Reusable primitives, no domain coupling
|   |   |       +-- ErrorBoundary.jsx
|   |   |       +-- LazyMountSection.jsx
|   |   |       +-- Reveal.jsx
|   |   |       +-- ScrollProgress.jsx
|   |   |       +-- ScrollToTop.jsx
|   |   |       +-- SkipLink.jsx
|   |   +-- hooks/                        # Shared React hooks
|   |   |   +-- useInView.js              # IntersectionObserver wrapper
|   |   +-- App.jsx
|   |   +-- main.jsx                       # Entry: mounts App, imports global CSS
|   +-- index.html
|   +-- vite.config.js
|   +-- postcss.config.js
|   +-- eslint.config.js
|   +-- package.json
|   +-- .env.example                      # Template for VITE_API_BASE_URL
+-- backend/
|   +-- server.js                         # Builds app (Helmet, CORS, body cap, error handler); exports app, listens when run directly
|   +-- config/
|   |   +-- env.js                        # Central env parsing + validation (single config object)
|   +-- routes/
|   |   +-- contactRoutes.js              # Validation + rate limit -> mailer service
|   +-- services/
|   |   +-- mailerService.js              # Resend delivery + branded HTML/text email template
|   +-- test/
|   |   +-- contact.test.js               # 9 API tests (node --test): health, validation, 16 KB cap, honeypot, 404
|   +-- package.json
|   +-- .env.example                      # Template for RESEND_API_KEY, EMAIL_TO, EMAIL_FROM, ALLOWED_ORIGINS
+-- postman/
|   +-- Portfolio-API.postman_collection.json              # Requests + tests for every endpoint
|   +-- Portfolio-API.postman_environment.json             # baseUrl variable (local default)
|   +-- Portfolio-API.postman_environment.production.json  # baseUrl variable (live Render backend)
|   +-- README.md                                          # Import + usage instructions
+-- scripts/
|   +-- gen-og-card.mjs                   # Rebuilds the 1200x630 social card (see Design)
+-- graphify-out/                         # Knowledge graph output - GITIGNORED, absent on a fresh clone
|   +-- graph.html                        # Interactive graph (open in browser)
|   +-- graph.json                        # Raw graph data (GraphRAG-ready)
|   +-- GRAPH_REPORT.md                   # Communities, hub nodes, knowledge gaps
+-- .editorconfig                         # Cross-platform editor settings
+-- .gitattributes                        # Normalized line endings, binary detection
+-- .gitignore
+-- .npmrc                                # Strict engine enforcement
+-- .nvmrc                                # Node 24 (Active LTS) - CI reads this file
+-- LICENSE                               # MIT
+-- netlify.toml                          # Pins NODE_VERSION on Netlify
+-- package.json                          # Root scripts: install:all, dev:*, build, lint
+-- README.md
+-- SECURITY.md                           # Vulnerability reporting policy
```

---

## Caching & Cache-Busting

Cache rules live in `frontend/public/_headers` (Netlify edge headers):

| Path | Cache | Why |
|------|-------|-----|
| `/`, `/index.html`, `/404.html` | `max-age=0, must-revalidate` | A deploy is visible on the next browser visit -- never serve stale HTML |
| `/sw.js` | `max-age=0, must-revalidate` | Kill-switch SW (see below) needs to reach users without a 24 h delay |
| `/assets/*` | `max-age=31536000, immutable` | Filenames are content-hashed by Vite -- 1-year cache is correct |
| `/fonts/*` | `max-age=31536000, immutable` | Filename encodes family+subset+weight, so the bytes never change -- a new typeface means a new file at a new URL |
| `/images/*` | `max-age=0, must-revalidate` | Unlike `/assets/*`, these filenames are stable -- a `max-age` here would keep serving an old portrait after a swap |

### Stale service worker recovery

The site briefly shipped with `vite-plugin-pwa`. Visitors from that
window still have a service worker installed locally that intercepts
every request and serves cached files. To recover:

- `frontend/public/sw.js` is a **kill-switch SW** -- on next update, it
  deletes every cache the old SW created, unregisters itself, and
  reloads open tabs.

No inline cleanup script lives in `index.html` -- the kill-switch SW handles
recovery on its own, so this costs no additional CSP script hash beyond the
analytics snippet the page already carries (see [Analytics](#analytics)). Once
analytics show no SW traffic for ~30 days, `sw.js` can be deleted.

---

## Analytics

Google Analytics 4 (`G-E5YE59PWT0`), loaded from a small inline snippet at the
top of `<body>` in `frontend/index.html`. There is no `gtag.js` tag in `<head>`
and no analytics package in `package.json`.

Two things about it are deliberate and easy to break:

1. **It's deferred to `requestIdleCallback`** (falling back to `setTimeout`).
   The tag only starts fetching once the main thread is idle, so it never
   competes with first paint or the hero font preload.
2. **The snippet is hash-pinned in the CSP.** `frontend/public/_headers`
   carries `'sha256-DcZnhiXzGRqf7Ap1FmHxA25PvMu+ebywXAvTxOAgB+E='` in
   `script-src`, and that hash covers the script's bytes *exactly* --
   whitespace included.

> **Editing the snippet by even one character silently kills analytics.** The
> browser blocks the script for failing the hash; the page renders perfectly
> and nothing appears in the console for most users. If you change it,
> recompute the hash and update `_headers` in the same commit:
>
> ```bash
> # from frontend/ -- prints the value to paste into _headers
> node -e "const fs=require('fs'),c=require('crypto');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/);console.log('sha256-'+c.createHash('sha256').update(m[1]).digest('base64'))"
> ```

`script-src` also lists `'unsafe-inline'`, but that is a legacy fallback only:
per CSP Level 3, a browser that understands hashes ignores `'unsafe-inline'`
entirely, so the hash is what's actually enforced. The GA/GTM hosts are
allow-listed narrowly -- `googletagmanager.com` in `script-src`,
`*.google-analytics.com` in `img-src`, and both plus `*.analytics.google.com`
in `connect-src`.

---

## Architecture

The frontend follows a **layered component structure** so new code has an
obvious home as the project grows:

| Layer | What lives here | Examples |
|-------|-----------------|----------|
| `components/layout/` | App chrome that frames every page | `Navbar`, `Footer` |
| `components/sections/` | One file per visible page section | `Hero`, `About`, `Projects`, `Contact` |
| `components/ui/` | Reusable primitives with no domain coupling | `Reveal`, `ScrollProgress`, `ScrollToTop`, `SkipLink`, `ErrorBoundary`, `LazyMountSection` |
| `hooks/` | Cross-cutting React hooks | `useInView` (used by `Reveal` + `LazyMountSection`) |
| `data/` | Pure content (no JSX), edited to update site copy | `about.js`, `experience.js`, `projects.js`, `interests.js`, ... |
| `styles/` | Global CSS - reset, tokens, layout, components | `reset.css`, `base.css`, `navbar.css`, `hero.css`, `components.css` |

Imports use the **`@/` alias** that maps to `frontend/src/` (configured in
`vite.config.js`), so paths stay flat regardless of folder depth:

```js
// good - same wherever this lives
import Reveal from "@/components/ui/Reveal";
import { projects } from "@/data/projects";

// bad - fragile if the file moves
import Reveal from "../../ui/Reveal";
```

---

## Knowledge Graph

A machine-generated knowledge graph of the whole project (code + docs) can be
built into `graphify-out/`:

| File | What it is |
|------|------------|
| `graph.html` | Interactive graph - open in any browser, no server needed |
| `GRAPH_REPORT.md` | Plain-language audit: communities, hub nodes, knowledge gaps |
| `graph.json` | Raw graph data (GraphRAG-ready) |

The most recent run indexed 32 files (~30.7k words) into 118 nodes, 104 edges
and 35 communities (Contact Form Request Pipeline, Backend Security Hardening
Stack, SEO & Structured Data Layer, …).

**`graphify-out/` is gitignored in full** -- it's regenerated output, not
project source, so nothing under it ships in the repo. Expect the directory to
be absent on a fresh clone; rebuild it locally rather than looking for it in
git history.

---

## Local Setup

Requires **Node.js 22.13+** (24 recommended - use [nvm](https://github.com/nvm-sh/nvm): `nvm use`).

### 1. Clone

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
```

### 2. Install both workspaces

Root convenience scripts (in `package.json`) install and run each side
without changing directories:

```bash
npm run install:all        # installs frontend + backend deps
```

| Script | What it does |
|--------|--------------|
| `npm run install:all` | Install dependencies for both `frontend/` and `backend/` |
| `npm run dev:frontend` | Start the Vite dev server (`http://localhost:5173`) |
| `npm run dev:backend` | Start the API with auto-reload (`http://localhost:5000`) |
| `npm run build` | Production build of the frontend |
| `npm run lint` | Lint the frontend |
| `npm test` | Run the backend API test suite (`node --test`) |
| `npm start` | Start the backend (production mode) |

### 3. Frontend

```bash
cd frontend
cp .env.example .env       # optional override of VITE_API_BASE_URL
npm install
npm run dev
```

Runs at `http://localhost:5173`

### 4. Backend

```bash
cd backend
cp .env.example .env       # required -- fill in real values
npm install
npm run dev                # auto-reloads on change (or `npm start` for prod)
```

Runs at `http://localhost:5000`

---

## Environment Variables

### `backend/.env`

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | no (Render sets this) | Listen port |
| `NODE_ENV` | recommended | `production` suppresses error-detail leaks |
| `RESEND_API_KEY` | yes | API key from https://resend.com |
| `EMAIL_FROM` | yes | Verified sender (or `onboarding@resend.dev` for testing) |
| `EMAIL_TO` | yes | Where contact-form messages land |
| `ALLOWED_ORIGINS` | no | Comma-separated browser origins allowed to call the API. Unset = built-in defaults (localhost + live domains) |

### `frontend/.env` (optional)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Override the default backend URL during local dev |

---

## Adding Content

All portfolio content is centralized in `frontend/src/data/`:

- **New experience?** Add an entry to `experience.js`
- **New project?** Add an entry to `projects.js`
- **New skill group / tag?** Add an entry to `skills.js`
- **New role, principle or topic?** Add an entry to `interests.js`
- **Approach copy, a stat, a degree?** Edit `about.js`
- **Update contact / social links?** Edit `portfolio.js`

Components are pure UI -- they read from the data layer and render automatically.

**Icons are keys, not components.** `skills.js`, `interests.js` and `about.js`
carry a string (`icon: "rag"`); the section component maps it to a `react-icons`
component through a lookup at the top of the file. That's what keeps the data
files free of JSX. A key with no entry in the map renders no icon rather than
crashing, so a typo is a missing glyph, not a blank section.

**Stats in `about.js` are aggregates, not new claims.** Every figure there is
already stated in `experience.js` or `projects.js`; the band exists because a
recruiter skimming prose never adds them up. Change a figure in one place and
change it in the other, or the page contradicts itself.

---

## Testing

Two layers:

- **Automated** - 9 backend API tests run with `npm test` (from the repo root or `backend/`). They use Node's built-in test runner (`node --test`), spin the app up on an ephemeral port, and assert both health probes, the three validation paths (missing fields, invalid email, over-length field), the 16 KB body cap's `413`, both honeypot branches (filled → silent drop, empty → normal handling), and the 404 catch-all -- all without sending real email. CI runs them on every push/PR.
- **Manual / live** - a ready-to-import Postman collection in [`postman/`](postman/):

- **`Portfolio-API.postman_collection.json`** -- one request per endpoint plus negative cases (missing fields, invalid email, over-length field, 16 KB body cap, rate-limit, 404, wrong method). Every request has a `pm.test()` script that asserts status code and response shape.
- **`Portfolio-API.postman_environment.json`** -- `{{baseUrl}}` for local dev (`http://localhost:5000`).
- **`Portfolio-API.postman_environment.production.json`** -- `{{baseUrl}}` for the **live backend** on Render.

### Test the live API (no clone needed)

In Postman, **Import → Link** and paste these raw URLs, then select the
**Portfolio API - Production** environment:

- Collection: `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_collection.json`
- Production env: `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_environment.production.json`

The production env targets `https://portfolio-backend-kmum.onrender.com`. The
backend runs on Render's free tier, so the first call after idle can cold-start
(~30-60 s). **Heads-up:** a successful `POST /api/contact` against prod sends a
real email - use the validation / 404 / rate-limit requests for safe smoke tests.
See [`postman/README.md`](postman/README.md) for full notes.

Quick start:

```bash
# 1. Start the backend
cd backend && npm install && npm start

# 2. In Postman: Import both JSON files, pick the "Portfolio API - Local" env,
#    then either run individual requests or hit "Run collection" in the Runner.
```

To verify the rate limiter, open the **Runner**, pick the *"Rate limit triggered"* request, set iterations to **6+**, and run -- the 6th call should return `429` with `RateLimit-*` headers.

See [`postman/README.md`](postman/README.md) for full usage notes.

---

## Contact Form Flow

1. User submits the form (name / email / subject / message)
2. Frontend POSTs to `/api/contact` on the backend
3. `express.json({ limit: "16kb" })` rejects an oversized body with `413` -- it
   runs before the router, so this never reaches the limiter
4. `express-rate-limit` checks the requester's IP (5 / 15 min)
5. `contactRoutes` checks the honeypot: if the hidden `website` field has a
   value, it answers with the same `200` a real send gets and drops the message.
   Rejecting it would just teach a bot to omit the field
6. `contactRoutes` validates input (required, length caps, email regex)
7. `mailerService` renders a branded HTML + plain-text email (user input HTML-escaped, header fields sanitized) and sends it via Resend with the sender's address as `replyTo`
8. Errors map to precise codes -- `503` if the mailer is unconfigured, `502` if Resend rejects the send -- and a centralized handler ensures nothing leaks stack traces

---

## Security

- **Content Security Policy** -- HTTP header via Netlify `_headers`. `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`. The one inline script (analytics) is pinned by SHA-256 hash rather than allowed wholesale -- see [Analytics](#analytics) for why that hash must be recomputed if the snippet changes
- **Backend security headers** -- `helmet()` middleware (CSP-ready, X-Frame-Options DENY, no-sniff, Referrer-Policy)
- **HTML escaping** -- all user input is escaped before rendering in email templates
- **Email header-injection guard** -- CR/LF and control chars are stripped from header-bound fields (subject, reply-to) so a crafted value can't inject extra email headers
- **Rate limiting** -- `express-rate-limit` (5 requests / 15 min window, standard `RateLimit-*` headers)
- **Honeypot** -- the contact form carries a hidden `website` field. It is deliberately *not* `display:none`, since bots skip fields the browser reports as hidden; it is positioned off-screen and taken out of the tab order and the accessibility tree instead. A submission that fills it gets the same `200` a real send gets, and is dropped without sending. **A trip is logged with the sender's name and email** -- a false positive (an autofill or password manager filling the trap) would otherwise lose a real message silently, and with no email link in the UI the form is the only way to reach the site owner
- **Input validation** -- max lengths enforced (name: 100, email: 100, subject: 200, message: 5000)
- **Body-size cap** -- `express.json({ limit: "16kb" })` to prevent payload abuse
- **Trust-proxy=1** -- IP is read from the platform proxy hop only (Render); not blindly from client headers
- **CORS** -- silent reject on disallowed origins (no leaky 500s)
- **Graceful shutdown** -- SIGTERM/SIGINT close the server cleanly so platform restarts don't drop in-flight requests
- **Secret scanning** -- gitleaks runs in CI on every push and PR
- **Audit gate** -- CI fails on production-dependency vulnerabilities at `high` or above
- **DNS prefetch** -- preconnect hint for backend API to reduce first-contact latency
- **Reporting** -- see [SECURITY.md](SECURITY.md) for responsible disclosure

---

## License

MIT -- see [LICENSE](LICENSE)
