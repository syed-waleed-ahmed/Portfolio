# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The site deploys continuously from `main`, so a version heading marks a
documented milestone rather than a build artifact. Entries dated before this
file existed were reconstructed from the git history and group the work by
milestone rather than by individual commit.

## Unreleased

### Added

- **Build-time prerendering.** `npm run build` now compiles a server bundle of
  the app and writes the rendered page into `dist/index.html`
  (`frontend/scripts/prerender.mjs`); `main.jsx` hydrates it. The full page is
  in the HTML response, so text paints before JavaScript runs, crawlers and
  link previews see every section, and deep links such as `/#projects` land on
  the real document height. The `noscript` fallback became redundant and went.
- **Frontend content tests** (`frontend/test/data.test.js`, `npm test` in
  `frontend/`, and a CI step): every About figure must appear in the entry that
  claims it, project and experience copy stays in a shared length range, links
  are absolute `https`, keys are unique, and no copy uses a character outside
  the font subset. The first two were comment-only conventions before.
- Contact form: native `required`, `autocomplete` and `maxLength` matching the
  API's limits; focus moves to the first invalid field with its error linked by
  `aria-describedby`; results announce from a persistent live region; a notice
  after six seconds explains the backend's cold start; a 60-second timeout; and
  every failure message offers the email address as a fallback. Focusing the
  form sends one `no-cors` request to `/health` so the backend is waking before
  the visitor presses send.
- A direct-contact column beside the form (email, LinkedIn, GitHub, resume),
  and email, LinkedIn, GitHub and site-source links in the footer.
- `ExternalLink` component: every off-site link gets the same `rel` and tells
  screen-reader users it opens a new tab.
- Named landmarks: each section is `aria-labelledby` its heading.
- Mobile menu closes on Escape (returning focus to the toggle), on an outside
  click, and when the window widens past the breakpoint.
- 320px portrait variants (`Profile-320.{avif,webp}`, 19 KB and 27 KB) served
  through `srcset`/`sizes`, with a matching `imagesrcset` preload, so phones no
  longer download the 67 KB desktop portrait for an 88px avatar.
- `scripts/gen-og-card.mjs` renders the social card in the new font and palette.
  fontkit cannot apply weights to a WOFF2, so the script decompresses it to TTF
  in memory first (`wawoff2`, installed on demand with `sharp` and `fontkit`).
- A fifth About stat tile: **952 tests** guarding the RemindrAI service, its
  console and its tenant. The thesis is the largest piece of work on the page
  and was the only one with no figure in the band a recruiter actually scans;
  the number is the three repositories' measured suites (663 + 146 + 143), the
  same evidence base the thesis evaluation rests on, and is claimed in the
  MemorAIz Experience bullets, per the rule in `about.js`. `Vitest` joins the
  Web & Backend skill group for the same reason - testing was claimed nowhere.
- Icons across the site, drawn from the `react-icons` Font Awesome set already
  in the dependency tree. Every section header carries one, rendered through a
  new `SectionHeader` component so the six sections cannot drift apart; the
  Experience cards gained a per-role tile plus calendar and location icons on a
  dedicated meta row; the About stat tiles carry a corner icon each; the
  Projects period and the Contact form's success and error banners are marked
  too. All of them reuse the existing `.role-icon` tile treatment, so the icon
  language is one system rather than several.
- `docs/` documentation set: architecture, API reference, development, design
  system, deployment, testing and security controls.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1) and this
  changelog.
- Postman CORS folder covering the preflight from an allowed and a disallowed
  origin, and saved response examples on the primary requests.
- `docs/development.md` gained a Dependencies section: the per-workspace update
  commands, how majors are handled given that Dependabot skips them, and why a
  lockfile-only commit is the normal fix for a transitive advisory.
- `Computer Vision` and `Robotics` join the `Person` schema's `knowsAbout`
  list. Two of the six projects on the page are exactly those two things, and
  the structured data named neither, so a crawler read the page as narrower
  than it is. Both stay out of the Skills section deliberately: the target
  roles are AI/ML, and the TIAGo and connecting-rod cards already carry their
  own stacks.

### Changed

- The resume link points at a new Google Drive file. `resumeUrl` in
  `portfolio.js` is the single source for it, so the navbar button, the hero
  action and the contact column all follow from one edit.
- **Project copy re-checked against the repositories it describes**, and three
  cards corrected:
  - *Visual Inspection of Connecting Rods* described "defect classification on
    the production line", "95%+ classification accuracy" and "~80% less manual
    inspection time on the floor", with scikit-learn in the stack. The project
    is a Computer Vision course assignment: a classical OpenCV pipeline that
    measures rods from a fixed image set, with no learned model and no
    deployment. The card now says that, and the stack is Python, OpenCV,
    NumPy and SciPy.
  - *Multi-Agent AI Workflow System* is **Campaign Forge** in its repository. The
    stack listed LangGraph, which it does not use (it is built on the OpenAI SDK
    with Pydantic), and "research, copy, brief, and QA" agents where the code
    has research, copywriter, art-director and manager agents. The "cut manual
    effort by 90%" highlight appears nowhere in the repository and was replaced
    with its documented engineering (retries, validated output, 94% coverage,
    an adversarial eval corpus).
  - *Self-Correcting RAG* listed LangChain, which it does not use; the stack is
    now FastAPI, sentence-transformers, FAISS and Groq, and the unmeasured
    "cutting hallucinated outputs" highlight became what the code guarantees.
  - *TIAGo* now says it was a team of three, as its README credits.
- The About figures band drops "90%" and "95%+", the two figures above, and
  adds the 99.5% Fruugle category accuracy already stated in Experience. Four
  tiles, two columns on phones instead of one.
- **Visual redesign on the same identity** (dark navy, cyan accent). Hanken
  Grotesk replaces NTR: NTR ships one weight, so every bold on the site was
  synthesised by the browser. Section headers are left-aligned with no icon
  badges or gradient rules; cards lost their hover lift, which implied they
  were clickable; tags are neutral rather than cyan; gradient text is gone.
- Hero keeps the "hi, Waleed here." greeting and caret, now followed by what
  the work is and a single primary action (View projects).
- The Interests section is folded into About as "Roles I'm targeting". Its
  three principle chips ("Clean architecture", "Reproducible workflows",
  "Prototype to production") were removed as generic.
- Experience is a CV-style list (dates beside each role) rather than three
  narrow columns; Skills is a definition list rather than six cards. Twilio and
  Upstash QStash moved to Data & Messaging and Power BI to ML & Data, from
  Cloud & DevOps. ".NET ASP Core" is now "ASP.NET Core".
- The navbar has a Resume button and no Home link (the name links home), and
  is `position: sticky` rather than fixed.
- In-page links (navbar, name, "View projects", skip link) go through a new
  `SectionLink` component: they scroll to the section without leaving
  `#section` in the address bar, as the old navbar did, and move keyboard focus
  to the section they jump to.
- The reading-progress bar is a CSS scroll-driven animation instead of a
  `ScrollProgress` component with a scroll listener.
- Scroll reveals only affect content below the fold, only after hydration, and
  move 12px instead of 28px. The observer uses threshold 0; the old 0.18 ratio
  could never be reached by an element taller than the viewport.
- `ErrorBoundary` wraps each section separately and offers a page reload; its
  old "Try again" re-rendered the same failing tree.
- The social card and 404 page use the new font and palette.
- `index.html`: shorter meta description, non-standard `language` and redundant
  `googlebot` tags removed, and the backend `preconnect` (a TLS handshake on
  every page view for a form most visitors never use) reduced to
  `dns-prefetch`. The inline analytics snippet is byte-identical, so its CSP
  hash is unchanged.
- `vite.config.js` drops `build.target: "es2018"` for Vite's Baseline default,
  which is what the CSS already requires.
- Dependencies: `eslint-plugin-react-refresh` 0.5.6 to 0.5.7 and `resend`
  6.28.0 to 6.28.1.
- RemindrAI copy re-synced against the finished report, as of its 10 September
  revision, and cut to the density of everything around it. Its Experience
  bullets ran 25 to 35 words against 15 to 22 for the other two roles, and the
  project card carried a 58-word description, a 32-word highlight and six stack
  chips against 32 to 53 words, 9 to 26 words and four or five chips on the
  other cards. The bullets now run 19 to 24 words, and the card 42, 19 and
  five. The test figure moves from 952 to **985** (670 + 146 + 169, the three
  suites as the report re-measured them), on the About tile and in the
  Experience bullet together, per the rule in `about.js`. Two claims are new to
  the page, both taken from the report: the scheduler benchmark, stated as its
  shape (median claim latency near-flat from 1K to 100K due reminders) because
  the report says the absolute figures from a local database do not transfer;
  and identity pinning, the second of the two design decisions the thesis
  defends, which keeps a reminder's owner out of the model's reach. Account
  linking, dead-lettering and delivery-status reconciliation were cut to make
  room, and all three are still in the report. The card also drops "My
  Master's thesis:", which restated the role line printed directly above it,
  and the `Server Components` chip, which describes the console rather than the
  service and stays listed under Skills.
- Dependencies refreshed across both workspaces: `react` and `react-dom`
  `19.3.0`, `@types/react` and `@types/react-dom` `19.3.0`, `vite` `8.3.0` and
  `resend` `6.28.0`, plus a lockfile-only refresh inside the existing ranges
  (among them `rolldown` `1.2.8` and `postcss` `8.5.28` on the frontend, `ip-address`
  `10.7.0` and `negotiator` `1.1.0` on the backend). All minor or patch. Both
  workspaces report zero advisories, lint is clean, and the backend suite
  passes 9/9. **React 19.3 costs 8.6 KB of gzipped JS**: the entry chunk went
  from 72.4 KB to 81.0 KB. Building the previous commit with each bump applied
  alone puts all of it on `react-dom`, whose client build gained the release's
  new features (`<ViewTransition>`, Fragment refs, Trusted Types) whether a
  page uses them or not; Vite 8.3 is size-neutral. The README's bundle figure
  moves to match. Pinning React back to 19.2 recovers the 8.6 KB if leanness
  ever outweighs staying current.
- Thesis content re-synced against its source repositories (`RemindrAI`,
  `remindr-dashboard`, `hfarm_new`), which had moved since the copy was written.
  The thesis is now titled *"An Embeddable, Multi-Tenant Reminder and
  Multi-Channel Communication Capability for Conversational Applications"*, so
  the Projects card leads on **embeddability** rather than portability, and both
  it and the Experience bullets say "communication capability" rather than
  "memory service". Two facts new since the last pass are folded in: delivery
  now reconciles the provider's own status callbacks after a send (a send
  records acceptance, which is no longer the ledger's last word), and H-FARM's
  Student Assistant is named as the first *production* tenant. A second pass,
  against the finished report rather than the repositories alone, folded in
  three more: tenancy is enforced at four independent depths, account linking is
  one tap over Telegram and Discord against single-use tokens rather than a deep
  link carrying the student's own identity, and the console runs plans, quotas
  and GDPR while holding no database and no authorization rule of its own.
- Graduation is fixed rather than open-ended: the October 2026 session is
  confirmed, so the Education entry reads "Sep 2024 - Oct 2026 (expected)"
  instead of "Present", and the hero sub-lead and the `<noscript>` fallback both
  give the date. A recruiter reading the page now knows when I am available
  without having to ask.
- Dependencies refreshed across both workspaces: `eslint` `10.10.0`,
  `@vitejs/plugin-react` `6.1.1`, `@types/react-dom` `19.2.7`,
  `eslint-plugin-react-refresh` `0.5.6`, `globals` `17.12.0`,
  `express-rate-limit` `8.7.0` and `resend` `6.26.0`. All patch or minor, so no
  migration was involved. Two transitive advisories were cleared in the
  lockfiles alone, needing no `package.json` edit: `browserslist` (high, unbounded
  memory growth) on the frontend and `qs` (moderate, array-limit bypass) on the
  backend. Both workspaces report zero advisories, lint is clean, and the backend
  suite passes 9/9.
- Dependencies: `eslint` `10.10.0` to `10.11.0`, and **`dotenv` `17.4.2` to
  `18.0.1`**. Dependabot ignores npm majors by design, so this one got the
  manual changelog read that policy asks for: v18 moves the package internals
  from `lib/` to `dist/` and drops the `./lib/env-options` and
  `./lib/cli-options` subpath exports, neither of which this repo imports.
  `config/env.js` uses only `dotenv.config({ quiet: true })`, which v18 still
  documents and which still suppresses the boot banner. Both workspaces report
  zero advisories, lint is clean, and the suites pass 7/7 on the frontend and
  9/9 on the backend.
- `sitemap.xml` `lastmod`, the `ProfilePage` `dateModified` and the `humans.txt`
  date moved to 2026-09-19. All three had stayed at 2026-09-16, a date older
  than the site they describe.
- Site copy rewritten to remove the tells of machine-written prose: the three
  em dashes and arrow glyphs are gone, and so is the sentence-fragment tic that
  negates the clause before it ("Not notebooks that only run on my machine",
  "not pitch-deck mockups"). Casual register was raised throughout, with no
  figure, date, employer or technology claim altered.
- Section headers put the icon inline with the title rather than in a block
  above it. Stacked, the tile read as a loose graphic floating over the
  heading; the tile is now sized in `rem` against the heading's line box and
  steps down at both breakpoints where the title does.
- Repetition cut across sections. The Interests section lost its "Currently
  Exploring" tile row, whose five entries were each already claimed in the hero
  lead or the Skills groups. The About "Approach" card no longer restates the
  section subtitle one line below it. The RemindrAI project highlight now
  states the thesis claim rather than repeating the deployment sentence that
  the MemorAIz experience entry already carries almost word for word.
- Skills trimmed of four tags that padded the count without adding a claim:
  `VS Code`, `Jupyter`, `Git` and `HTML/CSS`. An editor listed as a skill makes
  the tags that do matter harder to find.
- Backend moved from Express 4 to Express 5 (`4.22.2` to `5.2.1`). Express 4 is
  in maintenance, and nothing in this codebase depended on the removed API, so
  the upgrade is a version bump rather than a migration. The full suite passes
  unchanged.
- Dependencies refreshed across both workspaces: `express-rate-limit` `8.6.2`,
  `resend` `6.20.0`, `vite` `8.2.1`, `eslint` `10.8.1`, `globals` `17.11.0`,
  `@vitejs/plugin-react` `6.0.5`, `eslint-plugin-react-refresh` `0.5.4` and the
  React type packages. Both workspaces report zero advisories.
- Both `.env.example` files rewritten as sectioned, fully annotated templates,
  each stating what breaks when a variable is missing rather than only what it
  holds. The backend template now lists the built-in CORS defaults, since
  setting `ALLOWED_ORIGINS` replaces them rather than adding to them.
- Local development standardized on port 5000, which is what the README, `docs/`
  and the Postman local environment already documented.
- `dotenv.config()` runs with `{ quiet: true }`, so the banner dotenv prints by
  default no longer opens the Render deploy log ahead of the app's own lines.
- `README.md` restructured as an entry point and documentation index, with the
  detailed reference material moved into `docs/`.
- `SECURITY.md` scoped to disclosure policy, with implemented controls moved to
  `docs/security.md`.
- Postman requests renamed to a single convention, and the collection and
  environment descriptions brought in line with the current API.
- PR template covers the changelog, the Postman collection and `docs/`.

### Removed

- **Bootstrap and PurgeCSS.** Bootstrap supplied a grid, a handful of utilities
  and a form-control style, and PurgeCSS existed only to strip the rest; the
  pair also made `NODE_ENV=production` a silent requirement of every build.
  Replaced by about 1,600 lines of commented plain CSS in cascade layers
  (`styles/index.css` declares `reset, tokens, base, layout, components,
  utilities`), with design tokens, native nesting, `clamp()` type, logical
  properties, `color-mix()`, a container query on the contact form, and each
  component's styles beside its JSX. Gzipped CSS fell from 9.95 KB to 5.8 KB,
  24 packages left the frontend tree, and `postcss.config.js` is gone.
- Section code-splitting, `LazyMountSection`, the `requestIdleCallback`
  mount-all effect, the forced scroll-to-top on load and `useInView`. With the
  page prerendered they no longer bought anything, and the forced scroll broke
  shared links to a section. Total JS went from 81 KB plus 9.5 KB of section
  chunks to one 81 KB bundle.
- The icon-key lookup maps in Experience, Skills, Interests and About, and the
  `icon` fields in the data files that fed them.
- `frontend/public/fonts/ntr-latin-400.woff2`.

### Fixed

- The hidden back-to-top button was still reachable with Tab. It is `inert`
  until visible, and moves focus to `<main>` when used.
- The focus ring set `border-radius` on focus, squaring off circular controls.
- The navbar name had `aria-label="Home"`, which replaced its visible text as
  the accessible name (WCAG 2.5.3, label in name).
- A project highlight box stretched to the height of its row neighbour's,
  leaving a band of empty background under shorter text.
- Below 576px the hero's Bootstrap row overflowed the viewport by 12px on each
  side, masked by `overflow-x: hidden` on `body`; both are gone.
- The contact form comment cited a 5000-character cap in `validate()` that did
  not exist. The cap is now enforced with `maxLength`, matching the API.
- A non-JSON error response (a proxy page during a Render cold start) surfaced
  as a JSON parse error in the form.
- **The RemindrAI project card made two claims the system does not support.**
  It said the console "runs plans, quotas and GDPR", but the console has no
  data-subject surface: export and erasure are RemindrAI's subject-rights API,
  and the only mention of them in the console is a note pointing an
  organization there. It also said the agent "schedules from plain chat across
  Email, WhatsApp, Telegram, and Discord", but email is delivery-only by design
  and an inbound email never reaches the agent; of the four, only the other
  three carry a conversation. The card now names the four channels as delivery
  targets, and GDPR appears only in the Experience bullet about the control
  plane, which is where it lives.
- **The documented CSP hash command produced a wrong hash on Windows**, which
  is the one failure this repository is loudest about: the analytics snippet is
  pinned by SHA-256, and a bad hash blocks the script with no console error and
  no visible symptom. `.gitattributes` stores `index.html` with LF, so LF is
  what Netlify serves and what the browser hashes, but a Windows working copy
  holds CRLF and the command hashed those bytes. Following the documentation
  exactly would therefore have broken analytics silently. The command now
  normalizes line endings, and the section says to verify it reproduces the
  hash already in `_headers` before trusting it. The committed hash was correct
  throughout; only the instructions for regenerating it were wrong.
- **Three documents described a `featured` project flag that does not exist**
  and never did: the README data sample set it, `docs/development.md` told you
  to set it for "the centrepiece card", and `docs/design.md` credited it with
  the gradient top rule. The README sample also carried a `period` field that
  `projects.js` has no such key for and `Projects.jsx` never reads. Anyone
  following the README to add a project was copying two dead fields.
- `docs/design.md` attributed the indigo-to-cyan 2px rule to two card families;
  it actually runs across three (About stat tiles, Skills cards, Interests role
  cards), with the principle chips carrying the same gradient as a dot. Its
  list of icon containers held outside the NTR type scale was also five short -
  `.section-icon`, `.about-stat-icon`, `.experience-icon`, `.role-icon` and
  `.project-highlight-icon` all arrived with the site-wide iconography and were
  never added, so a future rescale of the type system would have swept up five
  glyph sizes that are not text.
- `docs/architecture.md` omitted `SectionHeader` from the `components/ui/`
  layer, the one component all six section headings render through. It also now
  records why that component takes an icon *component* while `data/` files pass
  string keys, since the two rules sit a paragraph apart and read as a
  contradiction otherwise.
- `humans.txt` reported Express 4 and a July build date, both stale since the
  Express 5 upgrade.
- The `404.html` style comment pointed at `.hero-cta-primary`, a class that no
  longer exists anywhere in the codebase; it is `.btn-outlined--accent`.
- High-severity `ip-address` advisories (SSRF and trust-boundary bypass through
  leading-zero octets, CIDR suffixes and IPv4-mapped addresses), reached
  transitively through `express-rate-limit`. Resolved in the lockfile at
  `10.5.0`. This was a production dependency, so it would have failed the CI
  audit gate on the next run.
- High-severity `nanoid` advisory in the frontend's dev tree, resolved in the
  lockfile. Dev-only, so it was not failing CI.
- Contact tests in the Postman collection report a `429` as skipped rather than
  failed, so a full-collection run no longer fails on requests whose only
  problem is that the shared 5-per-15-minute window is exhausted.
- Documented backend security headers now match what Helmet actually sends
  (`X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`); the stricter
  `DENY` set belongs to the Netlify site headers.
- Documented CORS behaviour corrected: a disallowed origin receives a response
  with no `Access-Control-Allow-Origin` rather than a `403`. The inaccurate
  comment in `server.js` was corrected too.

## 1.0.0 - 2026-07-15

The redesign that produced the current site.

### Added

- Honeypot field on the contact form, answered with the same `200` a real send
  returns, and logged with the sender so a false positive is recoverable.
- Single button system (`.btn-outlined` with `--accent` and `--icon`
  modifiers), replacing per-section button styles.
- Reproducible 1200x630 social card generated by `scripts/gen-og-card.mjs`.
- Postman coverage for the 16 KB body cap and the honeypot.

### Changed

- Navy palette, NTR typography and a flatter layout; every colour moved to a
  `:root` token.
- Portrait served at 2x its display slot, sized top-down from the circle rather
  than from the image.
- Images revalidate on every visit so a swapped photo is never served stale.
- Node moved to 24 after 20 reached end of life; CI reads the version from
  `.nvmrc` instead of a hardcoded number.
- Dependabot stopped ignoring GitHub Actions majors, which had left
  `checkout`/`setup-node` three majors behind.

### Fixed

- Anchor jumps land on the correct section, with smoother scrolling.
- Email template ink matched to the site background.

## 0.6.0 - 2026-06-28

### Added

- RemindrAI (MemorAIz) featured across experience, projects and skills.
- Production Postman environment and live-API test links.
- Root scripts driving both workspaces, and `node --watch` for backend dev.
- README badges.

### Changed

- Hardened `.gitignore`; stopped tracking local editor and agent settings.
- HTML-escape hardening in the email template.

## 0.5.0 - 2026-05-19

### Added

- Postman collection with a full API test suite.
- Branded 404 page and a skip-to-content link.
- Caching strategy in `_headers`, plus a kill-switch service worker to recover
  visitors left with the retired PWA worker.
- `.editorconfig`, `.npmrc`, `SECURITY.md` and `.env.example` templates.

### Changed

- Components reorganized into `layout/`, `sections/` and `ui/`, with below-fold
  sections lazily mounted.
- Node version pinned consistently across `.nvmrc`, `netlify.toml`, CI and both
  `engines` fields.
- Dropped `tsparticles` from the frontend.

## 0.4.0 - 2026-04-20

### Added

- Centralized data layer in `frontend/src/data/`, starting with experience and
  the shared portfolio constants.
- `_headers` file configuring security headers and content types on Netlify.

## 0.3.0 - 2026-03-06

### Added

- Contact-form backend: Express API with validation, rate limiting and Resend
  delivery.
- Content Security Policy and security headers, with the inline analytics
  snippet pinned by SHA-256 hash.
- Hero entrance animations in CSS, and PurgeCSS for production builds.

### Changed

- Removed `framer-motion` in favour of CSS keyframes.
- Analytics deferred to `requestIdleCallback` so it never blocks first paint.
- URLs normalized to the apex domain.

## 0.2.0 - 2025-12-26

### Added

- SEO and performance pass: meta tags, lazy loading, AVIF/WebP portrait,
  optimized assets.
- Health route with a timestamp.

### Changed

- Email handling moved to Resend, with improved error handling.

## 0.1.0 - 2025-12-05

### Added

- Initial React portfolio: hero, about, experience, projects, skills, interests
  and contact sections.
- MIT licence and first README.
