# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio of Syed Waleed Ahmed, an AI engineer, live at https://syedwaleedahmed.me/. The repo is public and is meant to be read as a work sample, so docs and comments are part of the product.

Two independent npm projects, with no npm workspace linking them. Each has its own `package.json`, lockfile and `node_modules`; the root `package.json` only holds scripts that delegate.

- `frontend/`: React 19 + Vite 8, prerendered at build time, plain CSS. Deploys to Netlify.
- `backend/`: Express 5 (ESM). The only real endpoint is `POST /api/contact`, which validates and sends mail through Resend. Deploys to Render.

There is no database, auth or client-side router. Both sides deploy on every push to `main`, and CI does not hold a deploy back, so run the checks before pushing to `main`.

## Commands

Run from the repo root. Node is pinned to 24 by `.nvmrc` (`engines` is `>=22.13`, and `engine-strict=true` makes an older Node fail on install).

```bash
npm run install:all          # install both projects; also needed after pulling a Dependabot merge
npm run dev:frontend         # Vite on :5173 (client render only, no prerender or hydration)
npm run dev:backend          # node --watch on :5000
npm run lint                 # ESLint, frontend only; the backend has no linter
npm run build                # client build + SSR build + prerender into frontend/dist
npm test                     # backend API tests ONLY
npm test --prefix frontend   # frontend content tests; root `npm test` does not run these
npm run preview -- --port 4173   # from frontend/: serves dist, the only way to see the prerendered page
```

Single test, on Node's built-in runner:

```bash
npm test --prefix frontend --silent -- --test-name-pattern=density
cd backend && node --test --test-name-pattern="honeypot"
```

Which checks apply: frontend code needs `lint` and `build`; anything in `frontend/src/data/` needs the content tests; backend code needs `npm test`. CI runs all of these plus `npm audit --omit=dev --audit-level=high` per project and a gitleaks scan over full history. There are no frontend component tests and no browser tests in CI: the prerendering build is what catches a component that throws during render.

Frontend `VITE_API_BASE_URL` defaults to the live Render backend, so set it to `http://localhost:5000` in `frontend/.env` when working on the contact form. Without Resend variables the backend still boots and `/api/contact` returns `503`; the tests pass either way and never send mail.

## Frontend architecture

**Prerender then hydrate.** `npm run build` runs `vite build`, then `vite build --ssr src/entry-server.jsx --outDir dist-server`, then `scripts/prerender.mjs`, which injects the rendered `<App />` into `dist/index.html` and deletes `dist-server/`. `main.jsx` hydrates when the root has children and calls `createRoot` otherwise, so the dev server never exercises hydration. Two consequences:

- Render output must be identical at build time and in the browser. Dates, random values and `window` reads belong in effects, or get fixed at build time like `__BUILD_YEAR__` (Vite `define`). `CommandMenu.jsx` shows the `useSyncExternalStore` pattern for a value that differs per platform.
- Nothing may start hidden in the HTML. `Reveal` hides below-the-fold content only after hydration, by writing `data-reveal` straight to the node.

**Content is data.** All copy, links and figures live in `src/data/`; components are pure UI. These modules must stay importable by plain Node, because `test/data.test.js` imports them without a bundler: no JSX, no `@/` alias, relative imports with `.js` extensions. Everywhere else in `src/` uses the `@/` alias (`@` is `frontend/src`).

**`sections` in `data/portfolio.js` is the single source** for `App.jsx`, the dock and the command palette (`data/commands.js` derives its entries from the other data modules). Adding a section takes an entry in `sections`, a component in `components/sections/`, and a line in `SECTION_COMPONENTS` in `App.jsx`. Its `SectionHeader` id must be `<section id>-title`. The hero is outside `sections` and owns the reserved id `top`.

**Content tests encode rules that shipped wrong once** (`frontend/test/data.test.js`):

- Every `stats` figure in `about.js` must appear in an Experience or Projects entry naming its `source`, so change both together.
- Project descriptions run 32-53 words, highlights 9-26, with 4-5 stack chips; experience bullets run 12-26 words. When a new fact arrives, drop an older one rather than growing the entry.
- Each project has exactly one of `github` or `sourceNote`, because the cards share a subgrid row that would otherwise sit empty.
- Copy may only use characters in the font subset. `FONT_RANGES` in the test mirrors the `unicode-range` in `styles/base.css`. Arrows and similar symbols fail, so use `react-icons`.

Tests cannot check truth: project copy must come from that project's own repository or report, and a figure that cannot be traced to one does not go on the page.

**Heavy extras are lazy.** `cmdk` (palette), `react-activity-calendar` (graph) and `cobe` (globe) are separate chunks fetched on intent or proximity; sections themselves are eagerly bundled. A new library that earns its place loads the same way. A chunk failure must be contained: the palette's loader catches it because the dock sits outside every `ErrorBoundary`, and each section has its own boundary. Palette search uses `scoreCommand` rather than cmdk's default fuzzy score, which let long keyword lists match nearly anything.

**CSS.** Plain CSS in cascade layers, with the order declared once in `styles/index.css`, which `main.jsx` must import before `App`. Nothing is unlayered, so overrides need no `!important`. Global values are tokens in `styles/tokens.css`, component styles sit beside each component, class names are light BEM, and state lives in attributes (`[aria-current]`, `[data-reveal]`, `[open]`). The site is dark-only. Load-bearing details:

- The page must fill a desktop screen. A narrow single column was tried and rejected; widen by arranging sections in columns, not by stretching lines. Check 1440px and 1920px as well as phone.
- Project cards use `subgrid`, so `<Reveal as="li" className="project-card">` must stay a direct child of the grid. A wrapper element breaks the alignment.
- `GitHubActivity.css` and the globe reserve exact sizes around an 80rem breakpoint, so a layout change has to check both.
- Five places inline the palette by hand and need updating with the tokens: `GitHubActivityCalendar.jsx`, `LocationGlobe.jsx`, `public/404.html`, `<meta name="theme-color">` in both HTML files, and `scripts/gen-og-card.mjs`.

## Backend architecture

`config/env.js` to `routes/contactRoutes.js` to `services/mailerService.js`, assembled in `server.js`. Nothing outside `config/env.js` reads `process.env`, routes know nothing about email, and the mailer knows nothing about HTTP. The mailer throws `MailerNotConfiguredError` and `EmailDeliveryError`, which the route maps to `503` and `502`; anything else reaches the central handler as a generic `500`, keeping provider details out of responses.

`server.js` exports the app and only calls `listen()` when run directly, which lets tests bind an ephemeral port.

Middleware order is deliberate: Helmet, CORS, the 16 KB `express.json` cap, then the router's rate limiter (5 per IP per 15 minutes), honeypot, validation, send. The cap runs before the limiter so oversized bodies cost no quota. A filled `website` honeypot gets the same `200` as a real send, and is logged so a false positive stays recoverable. A disallowed CORS origin gets no header rather than an error. `ALLOWED_ORIGINS` replaces the built-in defaults instead of adding to them.

`FIELDS` in `contactRoutes.js` and `FIELDS` in `Contact.jsx` mirror each other, as does the honeypot name. Change them together.

## Things that fail silently

- **Inline analytics script in `frontend/index.html`:** pinned by SHA-256 in the CSP in `frontend/public/_headers`. Any edit, including whitespace, kills analytics with no visible symptom. Recompute with the command in `docs/deployment.md`, which normalizes CRLF; hashing a CRLF copy directly gives a wrong value.
- **`<div id="root"></div>` in `index.html`:** the prerender script finds it by exact string match.
- **Portrait preload in `index.html`:** `imagesrcset` and `imagesizes` must match the `<source>` in `Hero.jsx`, or the browser downloads the image twice.
- **`frontend/public/_headers`:** holds both the CSP and all cache rules, and `vite preview` does not apply it, so a CSP break does not show up in preview. A new third-party origin needs a CSP change here.
- **`frontend/src/data/github-activity.json`:** generated, and overwritten by a Monday commit to `main` from `refresh-activity.yml`. Hand edits do not survive, and that commit is the usual reason a push to `main` is rejected (`git pull --rebase`). Refresh by hand with `node frontend/scripts/fetch-github-activity.mjs`.
- **`frontend/public/sw.js`:** a kill-switch for an old PWA service worker, not leftover code. It stays until analytics show no service-worker traffic for about 30 days.
- **`public/images/og-card.png`:** generated. Run `npm i --no-save sharp fontkit wawoff2` in one command, then `node scripts/gen-og-card.mjs`. These packages stay out of `package.json` on purpose.

## Conventions

- **No em dashes anywhere:** code, comments, copy, docs, this file.
- Comments explain why, not what. Match the tone of the existing ones.
- Conventional Commits, under about 72 characters. Types in use: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `ci`, `content`, `seo`.
- Update docs in the same commit as the behaviour. Add a `CHANGELOG.md` entry under `Unreleased` for anything user-visible. If the API surface changes, update `docs/api.md` and the collection in `postman/`.
- Keep the lean bundle: no CSS framework, animation library, UI kit or state manager. Measure a new dependency with and without it.
- Keep the personal touches through any design clean-up: the hand-drawn crewmate favicon and the `hi, Waleed here.` hero greeting are deliberate.
- `graphify-out/` is generated and gitignored; leave it out of searches, reviews and edits.

## Where to read more

The docs are maintained and detailed, so read the relevant one rather than the whole tree:

| Topic | File |
|-------|------|
| Layout, rendering, request flow | `docs/architecture.md` |
| Tokens, type, layout, dock, palette, graph, globe, motion, a11y, generated assets | `docs/design.md` |
| Editing content, env variables, dependencies, troubleshooting | `docs/development.md` |
| Netlify, Render, CI, CSP hash, caching, releases | `docs/deployment.md` |
| Test coverage and known gaps | `docs/testing.md` |
| Endpoints, payloads, status codes | `docs/api.md` |
| Security controls and non-goals | `docs/security.md` |
| Contribution scope and PR workflow | `CONTRIBUTING.md` |
