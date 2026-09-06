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
- `sitemap.xml` `lastmod`, the `ProfilePage` `dateModified` and the `humans.txt`
  date moved to 2026-09-06 alongside the content change.
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
- `dotenv.config()` runs with `{ quiet: true }`, so the banner dotenv v17 prints
  by default no longer opens the Render deploy log ahead of the app's own lines.
- `README.md` restructured as an entry point and documentation index, with the
  detailed reference material moved into `docs/`.
- `SECURITY.md` scoped to disclosure policy, with implemented controls moved to
  `docs/security.md`.
- Postman requests renamed to a single convention, and the collection and
  environment descriptions brought in line with the current API.
- PR template covers the changelog, the Postman collection and `docs/`.

### Fixed

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
