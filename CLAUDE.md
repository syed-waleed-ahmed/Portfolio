# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio of Syed Waleed Ahmed, an AI engineer, live at https://syedwaleedahmed.me/. The repo is public and is meant to be read as a work sample, so docs and comments are part of the product.

Two independent npm projects, with no npm workspace linking them. Each has its own `package.json`, lockfile and `node_modules`; the root `package.json` only holds scripts that delegate, plus the dependency-free `test/invariants.test.js`.

- `frontend/`: React 19 + Vite 8, prerendered at build time, plain CSS. Deploys to Netlify.
- `backend/`: Express 5 (ESM). The only real endpoint is `POST /api/contact`, which validates and sends mail through Resend. Deploys to Render.

There is no database, auth or client-side router. Both sides deploy on every push to `main`, and CI does not hold a deploy back. Netlify does refuse one thing: its build command is `npm run build`, whose `prebuild` runs frontend lint, the content tests and the repository invariants, so a commit failing those keeps the previous deploy live. Render deploys every push regardless, and nothing gates the browser tests, size budgets or audit, so run the checks before pushing to `main`.

## Commands

Run from the repo root. CI and Netlify run Node 24, pinned twice: `.nvmrc` (read by CI) and `NODE_VERSION` in `netlify.toml` (read by Netlify from the repo root even though its base directory is `frontend`); the invariants test fails if they differ. `engines` is `>=22.13` for the root and backend and `^22.19.0 || ^24.5.0 || >=26.0.0` for the frontend (Size Limit's floor). `engine-strict=true` in the root `.npmrc` only reaches `npm run install:all`; installs run inside `frontend/` or `backend/`, including CI's, Netlify's and Render's, do not enforce engines.

```bash
npm run install:all          # install both projects; also needed after pulling a Dependabot merge
npm run dev:frontend         # Vite on :5173 (client render only, no prerender or hydration)
npm run dev:backend          # node --watch on :5000
npm run lint                 # ESLint, frontend then backend
npm run build                # prebuild gate (lint, content tests, invariants), then client + SSR build + prerender into frontend/dist
npm test                     # backend API tests ONLY
npm test --prefix frontend   # frontend content tests; root `npm test` does not run these
npm run test:invariants      # test/invariants.test.js: the couplings listed under "Checked couplings"
npm run size --prefix frontend      # gzip budgets in frontend/.size-limit.json; needs a build
npm run test:e2e --prefix frontend  # Playwright + axe against frontend/dist under the real CSP; needs a build
npm run preview -- --port 4173   # from frontend/: serves dist, the only way to see the prerendered page by hand
```

`npm run build --ignore-scripts` skips the prebuild gate; CI uses it because it runs those checks as separate steps.

Single test:

```bash
npm test --prefix frontend --silent -- --test-name-pattern=density
cd backend && node --test --test-name-pattern="honeypot"
node --test --test-name-pattern="palette" test/invariants.test.js
cd frontend && npx playwright test -g "contact form"
```

Which checks apply: frontend code needs `lint`, `build` and `test:e2e`; anything in `frontend/src/data/` needs the content tests; backend code needs `npm run lint` and `npm test`; anything named under "Checked couplings" needs `test:invariants`; a new dependency or a change to what the entry chunk imports needs `size`. CI (`.github/workflows/ci.yml`) runs all of these in four jobs, `frontend`, `e2e`, `backend` and `secret-scan` (gitleaks over full history), plus `npm audit --omit=dev --audit-level=high` per project. A weekly `links.yml` runs lychee over every link in the data files, `index.html` and the docs. There are no frontend component tests: the browser suite covers the two stateful components, the palette and the contact form.

Frontend `VITE_API_BASE_URL` defaults to the live Render backend, so set it to `http://localhost:5000` in `frontend/.env` when working on the contact form. Vite bakes that value into any build made with the file present, the real CSP blocks it, and `e2e/serve.mjs` refuses such a build with the fix: rebuild with the variable set to the production origin, which works in any shell (`VITE_API_BASE_URL=https://portfolio-backend-kmum.onrender.com npm run build` in bash; in PowerShell set `$env:VITE_API_BASE_URL` to it first, for that session). Clearing it with `''` works only in bash and PowerShell 7.5+: older PowerShell deletes an empty variable and Vite reads `.env` again. Without Resend variables the backend still boots and `/api/contact` returns `503`. No backend test can send mail whatever `backend/.env` holds: `contact.test.js` blanks those variables before importing the app, and `delivery.test.js` points the SDK at the reserved `.invalid` domain and answers it itself.

Dependabot alerts and security updates are on, so a transitive advisory usually arrives as its own PR; when it cannot (no patched version fits the dependents' ranges), run `npm audit fix` in that project for a lockfile-only commit, or add an npm `overrides` entry. Both `package.json` files override `minimatch` to `^11.0.1` for that reason, because ESLint 10.14 still requires `^10` and every 10.x is vulnerable; `docs/development.md#dependencies` says how to check it is safe and when to remove it. Never `npm audit fix --force` in `frontend/`, which clears a dev-only finding by downgrading ESLint a major.

On Windows, stop any running Vite (dev or preview) or `e2e/serve.mjs` before `npm ci` in `frontend/`. Vite holds rolldown's native binary open, and `npm ci` then fails with `EPERM` after it has already emptied `node_modules`. The symptom later is `eslint` not found, or `npm ls` reporting `react` missing.

## Frontend architecture

**Prerender then hydrate.** `npm run build` runs `vite build`, then `vite build --ssr src/entry-server.jsx --outDir dist-server`, then `scripts/prerender.mjs`, which injects the rendered `<App />` into `dist/index.html` and deletes `dist-server/`. It finds `<div id="root"></div>` in `index.html` by exact string. `main.jsx` hydrates when the root has children and calls `createRoot` otherwise, so the dev server never exercises hydration. Two consequences:

- Render output must be identical at build time and in the browser. Dates, random values and `window` reads belong in effects, or get fixed at build time like `__BUILD_YEAR__` (Vite `define`). `CommandMenu.jsx` shows the `useSyncExternalStore` pattern for a value that differs per platform.
- Nothing may start hidden in the HTML, and nothing may need JavaScript to be safe: the contact form renders `method="post"` so a submit before hydration never puts the message in the URL. `Reveal` hides below-the-fold content only after hydration, by writing `data-reveal` straight to the node, and a print rule shows it all again.

**IntersectionObserver callbacks receive a batch.** A busy main thread can deliver several entries for one node in one call, oldest first. Act if any entry intersects (`Reveal`, `GitHubActivity`) or read the newest (`LocationGlobe`); never destructure only the first, which once left content hidden.

**Content is mostly data.** Entries, figures and links live in `src/data/`. The exceptions are prose tied to one component: the hero's headline, lead and graduation note in `Hero.jsx`, each section's subtitle passed to `SectionHeader`, and the contact panel's text. The data modules must stay importable by plain Node: `test/data.test.js` imports them without a bundler, and `scripts/fetch-github-activity.mjs` imports `portfolio.js` in a workflow that skips `npm ci`. So no JSX, no `@/` alias, relative imports with `.js` extensions, and nothing imported into `portfolio.js` at all (the invariants test checks the imports). Everywhere else in `src/` uses the `@/` alias (`@` is `frontend/src`).

**`sections` in `data/portfolio.js` is the single source** for `App.jsx`, the dock and the command palette (`data/commands.js` derives its entries from the other data modules). Adding a section takes an entry in `sections`, a component in `components/sections/`, and a line in `SECTION_COMPONENTS` in `App.jsx`, plus an icon in `SECTION_ICONS` in `Dock.jsx` (it falls back to a generic one). Its `SectionHeader` id must be `<section id>-title`. The hero is outside `sections` and owns the reserved id `top`; the dock's Home link scrolls to the page's very top, not to the hero, so the masthead shows.

**Content tests encode rules that shipped wrong once** (`frontend/test/data.test.js`):

- Every `stats` figure in `about.js` must appear in an Experience or Projects entry naming its `source`, so change both together.
- Project descriptions run 32-53 words, highlights 9-26, with 4-5 stack chips; experience bullets run 12-26 words. When a new fact arrives, drop an older one rather than growing the entry.
- Each project names a picture: `image` is the stem of two files in `src/assets/projects/` (`<image>-480.avif`, `<image>-960.avif`, 2:1) and `imageAlt` says what it shows in 12-40 words. The picture is a crop of an image from that project's own repository (the thesis poster for RemindrAI), never a mock-up; `docs/design.md` lists each source.
- Each project has exactly one of `github` or `sourceNote`, because the cards share a subgrid row that would otherwise sit empty. An optional `demo` link sits beside `github` in that row, so it needs one.
- `skillIcons` in `skills.js` maps a tag to a symbol in the generated sprite `src/assets/skill-icons.svg`, and the two must hold the same ids. After editing the map, rebuild the sprite (see "Things that still fail silently"). A tag gets a mark only if it names a product, the mark reads at 16px and one of the two icon sets carries it; never substitute a look-alike.
- Copy may only use characters in the font subset. `FONT_RANGES` in the test mirrors the `unicode-range` in `styles/base.css`, and the test scans every export of every data module. Arrows and similar symbols fail, so use `react-icons` (the Search tooltip draws the Command key with `LuCommand` for this reason). JSX copy follows the same rule unchecked.

Tests cannot check truth: project copy must come from that project's own repository or report, and a figure that cannot be traced to one does not go on the page.

**Heavy extras are lazy.** `cmdk` (palette), `react-activity-calendar` (graph) and `cobe` (globe) are separate chunks fetched on intent or proximity; sections themselves are eagerly bundled. The palette opens from the dock, the graph sits inside Projects, and the globe inside the Contact panel's aside. A new library that earns its place loads the same way, and `frontend/.size-limit.json` budgets each chunk: the entry budget is under any one lazy library's size, so a static import of one fails `npm run size`. Change a budget in the same commit as the change that needs it. A chunk failure must be contained: the palette's loader catches it because the dock sits outside every `ErrorBoundary`, and each section has its own boundary. Palette search uses `scoreCommand` rather than cmdk's default fuzzy score, which let long keyword lists match nearly anything.

**CSS.** Plain CSS in cascade layers, with the order declared once in `styles/index.css`, which `main.jsx` must import before `App`. Nothing is unlayered, so overrides need no `!important`. Every colour is a token in `styles/tokens.css`, component styles sit beside each component, class names are light BEM, and state lives in attributes (`[aria-current]`, `[aria-disabled]`, `[data-reveal]`, `[open]`). The site is dark-only. Load-bearing details:

- The page must fill a desktop screen. A narrow single column was tried and rejected; widen by arranging sections in columns, not by stretching lines. Check 1440px and 1920px as well as phone.
- Project cards use `subgrid`, so `<Reveal as="li" className="project-card">` must stay a direct child of the grid. A wrapper element breaks the alignment. Their reveal stagger lives in `Projects.css` per column count, since the JSX cannot know how many cards a row holds. The light under the pointer is the card's `::before` and `::after`, which must stay absolutely positioned: in flow, a pseudo-element is a grid item and takes one of the seven rows (picture, context, title, description, highlight, stack, links).
- Skill marks are `<use>` references into one sprite, imported with `?no-inline` so it stays a URL. Do not swap them for `react-icons/si` components: that puts about 21 KB of path data into the entry chunk and again into the prerendered HTML, and fails the entry budget's purpose.
- `GitHubActivity.css` and the globe reserve exact sizes around an 80rem breakpoint, so a layout change has to check both. The graph slices whole weeks ending on the snapshot's last day; a slice that starts mid-week renders an extra column into the library's own scroller.
- Colours are roles, and three invariants hold the system: no stylesheet but `tokens.css` may write a colour (use a role or add one there; a mask's `black` is exempt), every text, accent and status token is 7:1 (WCAG AAA) on both `--color-bg` and `--color-surface`, and every hue's `-border` is that hue at 50% and its `-subtle` at 10%. The browser suite repeats the contrast check on the rendered page and on each state of the form. Borders come in three weights by job (`--color-border` hairline, `--color-border-strong` outline, `--color-border-field` at 3:1 for form fields).
- Pick the role for the job: `--color-inverse` and `--color-inverse-ink` for a light chip (pills, tooltips), never a text token as a background; `--color-warning` for a failure the visitor did not cause (rate limit, server down, network) and `--color-danger` only for something to correct. A tag has one look everywhere (`.tag` in `components.css`); Skills changes its size, not its colours. Outlined controls share one hover: accent border, 10% accent fill, label unchanged. `docs/design.md#states` has the table.
- Six places copy the palette by hand: `GitHubActivityCalendar.jsx`, `LocationGlobe.jsx`, `public/404.html`, `<meta name="theme-color">` in both HTML files, `scripts/gen-og-card.mjs`, and `BRAND` in `backend/services/mailerService.js` for the notification email. The invariants test fails when one drifts from the tokens.

## Backend architecture

`config/env.js` to `routes/contactRoutes.js` to `services/mailerService.js`, assembled in `server.js`. Nothing outside `config/env.js` reads `process.env`, routes know nothing about email, and the mailer knows nothing about HTTP. The mailer throws `MailerNotConfiguredError` and `EmailDeliveryError` (Resend rejected the send or could not be reached), which the route maps to `503` and `502`; anything else reaches the central handler as a generic `500`, keeping provider details out of responses. Body-parser client errors keep their own status (`400` malformed JSON, `413` over the cap, `415` encoding) and are logged by type only, since the raw error carries the request body.

`server.js` exports the app and only calls `listen()` when run directly, which lets tests bind an ephemeral port.

Middleware order is deliberate: Helmet, CORS, the 16 KB `express.json` cap, then the router's rate limiter (5 per IP per 15 minutes; IPv6 clients are keyed per /56), validation, honeypot, send. The body parser runs before the limiter, so oversized or malformed bodies cost no quota. The honeypot runs after validation and a tripped one gets the byte-identical `200` a real send gets, so the response gives a bot nothing to learn from (only its timing differs, since a real send waits for Resend): that is why no response carries Resend's message id (it is logged instead), and `backend/test/delivery.test.js` compares the two against a fake Resend. Trips are logged so a false positive stays recoverable. A disallowed CORS origin gets no header rather than an error. `ALLOWED_ORIGINS` replaces the built-in defaults instead of adding to them. `trust proxy` is set to `1` so the limiter keys on the client IP behind Render's proxy; a different hosting chain needs that revisited. The tests rely on it too: each quota-spending test sends its own `X-Forwarded-For`, so adding one never pushes another into a `429`.

`/health` is not only for monitoring: `Contact.jsx` sends it one `no-cors` request when the form is first focused, to wake the sleeping free-tier instance before the visitor presses send. Keep it cheap and outside the rate limiter.

`FIELDS` (names and max lengths), `EMAIL_RE` and the honeypot name `website` are duplicated between `contactRoutes.js` and `Contact.jsx`; the invariants test fails if they differ. In the email template the submitter's address goes into `mailto:` links URL-encoded as well as HTML-escaped, since `EMAIL_RE` admits `?`, `&` and `=`.

## Checked couplings

`test/invariants.test.js` reads source files only, so it runs before a build, and each failure says what to change. It pins what used to fail silently:

- **The analytics hash.** The inline script in `frontend/index.html` is pinned by SHA-256 in the CSP in `frontend/public/_headers`; any edit, including whitespace, would kill analytics with no visible symptom. Recompute with the command in `docs/deployment.md`, which normalizes CRLF.
- **The prerender target, the portrait preload** (`imagesrcset` and `imagesizes` in `index.html` against the AVIF `<source>` in `Hero.jsx`, or the image downloads twice), **the palette copies, the form mirrors, the 80rem breakpoint** shared by the graph's JS and two stylesheets, **the Node pins**, and **the API origin**: the default in `Contact.jsx` must be in the CSP's `connect-src` and the `dns-prefetch`.
- **The hand-kept dates:** `dateModified` in the `ProfilePage` JSON-LD, `<lastmod>` in `public/sitemap.xml` and `Last update` in `public/humans.txt` must agree. The test cannot know when content changed, so moving them is still on you.
- **No em dashes** in any tracked or new file.

## Things that still fail silently

- **Facts stated twice:** `index.html` carries its own copy of the content for crawlers: the meta description, Open Graph and Twitter text, and the `Person` JSON-LD (`jobTitle`, `alumniOf`, `knowsAbout`). A change of role or degree means the hero note, `experience.js`, `about.js` and that JSON-LD together; `worksFor` was removed when the thesis role ended and returns with a new job. `public/humans.txt` and the constants in `scripts/gen-og-card.mjs` repeat the name, role and links as well.
- **`frontend/public/_headers`:** holds both the CSP and all cache rules, and `vite preview` does not apply it. `e2e/serve.mjs` does, so the browser suite catches a CSP break on anything it loads. A new third-party origin needs a CSP change here, and so does pointing `VITE_API_BASE_URL` at a new backend (also update the `dns-prefetch`).
- **`frontend/src/data/github-activity.json`:** generated, and overwritten by a Monday commit to `main` from `refresh-activity.yml`. Hand edits do not survive, and that commit is the usual reason a push to `main` is rejected (`git pull --rebase`). It is pushed with `GITHUB_TOKEN`, so it starts no CI run, but Netlify builds it through the prebuild gate. Refresh by hand with `node frontend/scripts/fetch-github-activity.mjs`.
- **`frontend/public/sw.js`:** a kill-switch for an old PWA service worker, not leftover code. It stays until analytics show no service-worker traffic for about 30 days.
- **`frontend/src/assets/skill-icons.svg`:** generated from `skillIcons`. In `frontend/`, run `npm i --no-save --ignore-scripts simple-icons@16.36.0 @lobehub/icons-static-svg@1.101.0`, then `node scripts/gen-skill-icons.mjs`. Both packages stay out of `package.json`, and `--no-save` leaves them in `node_modules` only until the next `npm ci`. A content test catches a sprite that lacks an id and a browser test catches a mark that does not draw; nothing catches a mark that is simply the wrong picture, so look at the page.
- **`public/images/og-card.png`:** generated. Run `npm i --no-save sharp fontkit wawoff2` in one command, then `node scripts/gen-og-card.mjs`. These packages stay out of `package.json` on purpose.

## The browser suite

`frontend/e2e/site.spec.js` runs Playwright and axe-core against `frontend/dist`, served by `e2e/serve.mjs` with the `/*` headers from `dist/_headers`, so it sees the production CSP. Analytics and the backend are answered with `page.route`, so it never touches the network; a mocked cross-origin `POST` needs CORS headers and a preflight answer, as `mockContact` shows. Install the browser once with `npx playwright install chromium` in `frontend/`. Traps it already handles, worth knowing when adding a test:

- `html` has `scroll-behavior: smooth`, so a scripted `scrollTo` loop never arrives and `Reveal` never fires. `scrollThrough` forces `auto`, then visits anything still pending.
- A click or key press before hydration does nothing. Wait for `hydrated(page)` (the first `[data-reveal]`), or retry with `toPass` as `openPalette` does; under `reducedMotion: "reduce"` Reveal marks nothing, so only the retry works there.
- Every page draws the WebGL globe, in software in headless Chromium, so workers are capped (4 locally, 2 in CI) to keep runs from starving each other into timeouts.
- The dock floats over element screenshots and moves its `aria-current` as the page scrolls, so read navigation state from the DOM, not from a crop.

## Conventions

- **No em dashes anywhere:** code, comments, copy, docs, this file.
- Comments explain why, not what. Match the tone of the existing ones.
- Conventional Commits, under about 72 characters. Types in use: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `ci`, `content`, `seo`.
- Update docs in the same commit as the behaviour. Add a `CHANGELOG.md` entry under `## [Unreleased]` for anything user-visible. A release moves those entries under `## [X.Y.Z] - YYYY-MM-DD` with a compare link at the end of the file, sets that version in all three `package.json` files (the invariants test checks they match), and is tagged `vX.Y.Z` with a GitHub Release built from its section: the steps are in `docs/deployment.md#release-process`. If the API surface changes, update `docs/api.md` and the collection in `postman/`.
- Keep the lean bundle: no CSS framework, animation library, UI kit or state manager. Measure a new dependency with and without it, and prefer a release at least two weeks old; Dependabot waits seven days (`cooldown` in `.github/dependabot.yml`).
- Workflows pin every action to a full commit SHA with a `# vX.Y.Z` comment, and `actions/checkout` gets `persist-credentials: false` unless the job pushes.
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
| Test layers, how to run each, known gaps | `docs/testing.md` |
| Endpoints, payloads, status codes | `docs/api.md` |
| Running the Postman collection, including the rate-limit check | `postman/README.md` |
| Security controls and non-goals | `docs/security.md` |
| Contribution scope and PR workflow | `CONTRIBUTING.md` |
