# Changelog

Notable changes, newest first, in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format, with [semantic versions](https://semver.org/spec/v2.0.0.html). The site deploys continuously from `main`; a version marks a milestone, tagged `vX.Y.Z` with a GitHub Release. Entries before 3.0.0 are condensed to their summary lines; the full notes are in each GitHub Release.

## [Unreleased]

### Changed

- Nothing on the home page is said twice: the first screen no longer restates the thesis project or the case-study promise that the sections below give, so it fits on one screen with the facts row, and About no longer repeats the traineeship's wording from Experience. The Research Team case study's opening paragraph no longer repeats its summary.
- The resume is linked from the header only, no longer also from Contact and the command palette, and links use plain names: "Source" in the footer and "Case study" in Experience.
- The address bar stays clean: a section link, a case study's contents or the skip link scrolls to its target without adding `#contact` or similar to the address, and an address that arrives with one opens at that section and drops it.

## [4.1.0] - 2026-11-26

Follow-ups to 4.0.0 from a re-audit of the live site.

### Added

- `/.well-known/security.txt` (RFC 9116), naming the private vulnerability report and the email address.

### Changed

- The first screen has no buttons again, as asked before 4.0.0 brought two back.
- On a phone the featured project leaves its pipeline to the case study, like the other five.
- Each page downloads only its own code: a case study or the privacy page no longer loads the home page's, and every page preloads its chunk instead of waiting for the main script to ask for it.

### Fixed

- An address without its trailing slash, such as `/work/remindrai`, redirects permanently (301) instead of temporarily.

## [4.0.0] - 2026-11-26

A rebuild of the site's content, design and contact service, following an independent audit of 3.0.0.

### Added

- A case study for each project at `/work/<slug>/`: the problem, an architecture diagram, decisions and their costs, the evaluation with its limits, and next steps, each a prerendered page with its own metadata.
- Paired bootstrap intervals for the retrieval comparison in Self-Correcting RAG and the fine-tuning comparison in FastAPI Niche Assistant, computed from each project's per-item results.
- A privacy page that describes what the site does with data.
- A light theme beside the dark one, chosen by the system setting.
- Work authorisation and language levels on the first screen, as the CVs state them.

### Changed

- A new design: an editorial layout with text navigation, numbered sections and no text under 14px, replacing the template-derived dock, blur-fade reveal, pointer light and dot field. The greeting stays as the opening line; the heading now says what the work is.
- Experience follows the current CVs: the thesis role is an internship, Fruugle covers seven chains and was part-time, and H-FARM's assistant is a pilot tenant.
- Project results carry their caveats: a recall gain that rests on two questions, a fine-tuning gain measured against the untuned base model, author-written evaluation sets, and no human-label validation for the judge. Test counts no longer headline a project.
- Skills are split into those the work shows and those familiar from coursework or a traineeship; tools no CV supports are gone.
- The command palette ranks results itself. cmdk 1.1.1 could not reorder its groups, so a search for "rag" selected a section instead of the project.
- The contact form posts to the site's own origin, a Cloudflare Worker with an exact per-client rate limit in a Durable Object, and works without JavaScript. There is no cold start, no CORS and no second host.
- The frontend is strict TypeScript, type-checked in CI.
- The content security policy allows no inline script or style.
- The issue chooser no longer lists the security report twice, and release notes read as paragraphs.
- Tables and diagrams that scroll sideways on a phone can be reached and scrolled from the keyboard, are named for screen readers, and show a shadow at the edge that has more.
- The contact API checks a message before counting it against the rate limit, so fixing a typo never locks anyone out, and it sends nothing if the limiter cannot answer. Without JavaScript the browser checks the fields first, and an error page points back to the form.
- A project's title on the home page is no longer a second link to its case study.

### Fixed

- Case-study wording a second review found loose: the ONNX memory comparison in Self-Correcting RAG, which question's labelling favours dense retrieval, how RemindrAI's evaluation cases are scored, and each project's real dates.

### Removed

- Google Analytics, and with it every cookie and third-party request.
- The Express backend on Render and its Postman collection.
- The globe, the contribution graph with its weekly snapshot commit, and the skill-mark sprite.
- The ten-document backend audit and its self-issued certification. Its lasting finding, a rate limiter that counted proxies, does not apply on the Worker.
- `humans.txt`, the code of conduct, the pull-request template and two issue forms.

## [3.0.0] - 2026-11-24

### Changed

- The page was redesigned.
- The styles of everything below the hero are a stylesheet of their own.
- Print rules are a stylesheet of their own.
- The form field border is stronger.
- The contact email's header keeps its indigo for the first 60%.
- `.visually-hidden` no longer uses `!important`.

### Added

- The MemorAIz Onboarding Assistant in Experience.
- Tests for the redesign.

## [2.6.4] - 2026-11-22

### Fixed

- The structured data now validates cleanly.

## [2.6.3] - 2026-11-22

### Added

- The projects as structured data.

### Changed

- Search results and link previews name the work and the city.

## [2.6.2] - 2026-11-22

### Changed

- The title is now AI Software Engineer everywhere.

## [2.6.1] - 2026-11-20

### Fixed

- On Apple devices the dock's Search tooltip stood three lines tall.
- One card picture was larger than its source, against the rule.

### Changed

- ESLint checks the frontend's `.mjs` files.
- The weekly link check reads the whole of `docs/`.
- The rate limiter is configured with `limit`.
- Documentation corrected against the code.

### Removed

- Code that did nothing.

## [2.6.0] - 2026-11-20

### Fixed

- The contact form's rate limit counted all visitors together.
- A crafted subject or address could make the API answer `500`.
- A send could wait on Resend for five minutes.

### Changed

- Render deploys the backend only after CI passes.
- The backend's build installs production packages only.
- **An address holding a control character or an unpaired surrogate is
- The boot log names configuration that would fail silently.

### Added

- Tests for what could break without one noticing.
- An audit of the backend.

## [2.5.0] - 2026-11-19

### Added

- CrewAI and LiteLLM in Skills.
- An 840px portrait for high-density wide screens.
- A check of the live site after every deploy.
- The browser suite can run against a deployed origin.

### Changed

- The frontend deploys to Cloudflare Workers, and only after CI passes.
- Multi-Agent Research Team takes Campaign Forge's place in Projects.
- A new portrait.
- The AI Workflow Assistant's picture is re-cut.

### Fixed

- HTTPS is enforced again after the host move.
- Project pictures are chosen for their real width.
- The Projects subtitle no longer mentions university or robotics work.

### Removed

- **The previous host's default address is no longer an allowed

## [2.4.4] - 2026-11-15

### Changed

- AI Workflow Assistant takes the TIAGo card's place in Projects.
- The FastAPI Niche Assistant card follows its Qwen release.
- Self-Correcting RAG's test count is 347.

## [2.4.3] - 2026-11-14

### Changed

- Skills add llama.cpp, Google Cloud Run and Cloudflare Workers.

## [2.4.2] - 2026-11-14

### Fixed

- The hero's text is the first paint on a phone, not a fade later.
- Phones fetch a portrait their size.

### Changed

- Checked in the owner's own Chrome and with PageSpeed Insights.

## [2.4.1] - 2026-11-14

### Fixed

- Project pictures no longer break in a browser without AVIF.
- A Windows contrast theme no longer hides the two selected states.

### Changed

- The site was checked outside Chromium for the first time.
- Load speed since 2.1.4 was measured, not assumed.

## [2.4.0] - 2026-11-14

### Changed

- The colours are one system of named roles.
- A technology tag looks the same everywhere.
- Outlined controls share one hover.
- Project pictures rest a step dimmer.
- Pills and tooltips use an inverse pair of tokens.

### Added

- A warning colour, for failures that are not the visitor's.

### Fixed

- **An invalid field's border is easier to see than a valid one's,

## [2.3.1] - 2026-11-14

### Changed

- Stronger colour contrast across the page.

### Fixed

- Contact form fields have a visible boundary.

## [2.3.0] - 2026-11-14

### Added

- A picture on every project card.

### Changed

- The FastAPI Niche Assistant replaces the connecting-rod card.

## [2.2.0] - 2026-11-13

### Added

- Brand marks on the skill tags.
- A light under the pointer on project cards.

### Fixed

- Skill tags align on their text.

## [2.1.4] - 2026-11-12

### Changed

- Every Markdown document was reviewed against the code.

### Fixed

- The frontend's `engines` range matches Size Limit's.

## [2.1.3] - 2026-11-12

### Changed

- The GitHub activity snapshot is refreshed by hand.

### Fixed

- The footer's source link meets the touch-target floor.

## [2.1.2] - 2026-11-12

### Fixed

- The MemorAIz dates now match the resume and the GitHub profile.

## [2.1.1] - 2026-11-11

### Changed

- Skills and crawler data follow the re-synced projects.
- The Projects subtitle mentions the live demos.

## [2.1.0] - 2026-11-11

### Added

- Live demo links on project cards.

### Changed

- Three project cards re-synced with their repositories.
- The Bachelor's thesis card is removed.

### Security

- `minimatch` moves to 11 under ESLint.
- **The invariants test found the inline analytics script by its

## [2.0.0] - 2026-11-10

### Added

- Open-source repository structure.
- Command palette.
- GitHub contribution graph.
- Globe.
- Together these add about 2 KB of gzipped JS to the first load. Largest
- Build-time prerendering.
- Frontend content tests.
- Repository invariants.
- A build gate on the host.
- Bundle budgets.
- Browser tests.
- Backend linting.
- Weekly link check.
- Contact form: native `required`, `autocomplete` and `maxLength` matching
- A direct-contact column beside the form (email, LinkedIn, GitHub,
- `ExternalLink` component: every off-site link gets the same `rel` and
- Named landmarks: each section is `aria-labelledby` its
- 320px portrait variants (`Profile-320.{avif,webp}`, 19 KB and 27 KB)
- An About figures band.
- `docs/` documentation set: architecture, API reference, development,
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1) and
- Postman CORS folder covering the preflight from an allowed and a
- `docs/development.md` gained a Dependencies section: the per-workspace
- `Computer Vision` and `Robotics` join the `Person` schema's

### Changed

- The three manifests move to version 2.0.0 together (the frontend's
- Visual redesign on the same identity.
- Layout redesign.
- Hero keeps the "hi, Waleed here." greeting and caret, now followed by
- The Interests section is folded into About as "Roles I'm targeting".
- Skills is a definition list rather than six cards. Twilio and Upstash
- In-page links (the dock, "View projects" and the skip link) go through a
- The reading-progress bar is a CSS scroll-driven animation instead of
- Scroll reveals only affect content below the fold, and only after
- `ErrorBoundary` wraps each section separately and offers a page reload;
- Printing is now one token override in `tokens.css`. Stat figures, degree
- The social card and 404 page use the new font and
- `index.html`: shorter meta description, non-standard `language` and
- `vite.config.js` drops `build.target: "es2018"` for Vite's Baseline
- Graduated.
- `sitemap.xml` `lastmod`, the `ProfilePage` `dateModified` and the
- The resume link points at a new Google Drive file, four times over
- The project grid holds six cards. A TIAGo card (autonomous
- Project copy re-checked against the repositories it describes.
- RemindrAI copy re-synced.
- Site copy rewritten to remove the tells of machine-written prose: the
- Contact API: a tripped honeypot answers exactly as a send does.
- The backend suite grows from 9 to 18 tests in two files.
- Postman requests renamed to a single convention, and the collection
- CI runs four jobs: `frontend` (lint, content tests, repository invariants,
- Dependencies brought up to date in both projects. Two were majors,
- `README.md` restructured as an entry point and documentation index, with
- `SECURITY.md` scoped to disclosure policy, with implemented controls moved
- Both `.env.example` files rewritten as sectioned, fully annotated
- Local development standardized on port 5000, which is what the README,
- `dotenv.config()` runs with `{ quiet: true }`, so the banner dotenv prints
- Two hard-coded colours, the faint ring round a skill tag and the
- PR template covers the changelog, the Postman collection and

### Removed

- Bootstrap and PurgeCSS.
- Section code-splitting, `LazyMountSection`, the
- Decorative icons on card headings, Skills groups and contact form
- `frontend/public/fonts/ntr-latin-400.woff2`.

### Fixed

- Contact form.
- Printing left content the visitor had not scrolled to blank, since it
- `Reveal` and the contribution graph read only the first entry of
- The contribution graph drew one more week than it had measured for,
- The dock's Home link scrolled to the hero, cutting off the masthead and
- The globe's WebGL check ran on every screen, so phones, where the globe
- The project cards never faded in: their own `transition` (for the
- On Apple platforms the Search tooltip drew the Command key as U+2318,
- The graph's "View profile" link gets the full tap-target
- A malformed JSON body got a generic `500`. It now gets `400` "Malformed
- `backend/.env.example` shipped placeholder values for the three
- The notification email's "Received" time was in the server's time
- Comments that had drifted from the code: `portfolio.js` named a navbar as
- Documentation brought back in step with the code: the frontend test count
- The focus ring set `border-radius` on focus, squaring off circular
- A project highlight box stretched to the height of its row
- Below 576px the hero's Bootstrap row overflowed the viewport by 12px on
- The contact form comment cited a 5000-character cap in `validate()` that
- A non-JSON error response (a proxy page during a Render cold start)
- The RemindrAI copy had the agent chatting over email.
- The documented CSP hash command produced a wrong hash on Windows.
- Three documents described a `featured` project flag.
- `docs/architecture.md` omitted `SectionHeader` from the
- The `404.html` style comment pointed at `.hero-cta-primary`, a class that
- Contact tests in the Postman collection report a `429` as skipped rather
- Documented backend security headers now match what Helmet actually
- Documented CORS behaviour corrected: a disallowed origin receives a

### Security

- GitHub's own protections are on.
- The notification email's reply links could be rewritten by the sender.
- The error handler logged a rejected request body's whole error, to
- The CSP's `font-src` is `'self'` alone; nothing loads a `data:`
- Every GitHub Action in every workflow is pinned to a full commit SHA, with
- Dependabot waits seven days after a release before proposing
- High-severity `body-parser` advisory (GHSA-27r3-jxmh-p828, denial of
- Critical `proxy-addr` advisory.
- `ip-address` advisories under `express-rate-limit`, resolved in the
- Two transitive advisories cleared in the lockfiles alone, needing
- High-severity `nanoid`, `brace-expansion` and `source-map-js` advisories

## [1.0.0] - 2026-07-15

### Added

- Honeypot field on the contact form, answered with the same `200` a real
- Single button system (`.btn-outlined` with `--accent` and
- Reproducible 1200x630 social card generated by
- Postman coverage for the 16 KB body cap and the

### Changed

- Navy palette, NTR typography and a flatter layout; every colour moved to
- Portrait served at 2x its display slot, sized top-down from the circle
- Images revalidate on every visit so a swapped photo is never served
- Node moved to 24 after 20 reached end of life; CI reads the version
- Dependabot stopped ignoring GitHub Actions majors, which had

### Fixed

- Anchor jumps land on the correct section, with smoother
- Email template ink matched to the site

## [0.6.0] - 2026-06-28

### Added

- RemindrAI (MemorAIz) featured across experience, projects and
- Production Postman environment and live-API test
- Root scripts driving both workspaces, and `node --watch` for backend
- README

### Changed

- Hardened `.gitignore`; stopped tracking local editor and agent
- HTML-escape hardening in the email

## [0.5.0] - 2026-05-19

### Added

- Postman collection with a full API test
- Branded 404 page and a skip-to-content
- Caching strategy in `_headers`, plus a kill-switch service worker to
- `.editorconfig`, `.npmrc`, `SECURITY.md` and `.env.example`

### Changed

- Components reorganized into `layout/`, `sections/` and `ui/`, with
- Node version pinned consistently across `.nvmrc`, the host's config, CI and
- Dropped `tsparticles` from the

## [0.4.0] - 2026-04-20

### Added

- Centralized data layer in `frontend/src/data/`, starting with experience
- `_headers` file configuring security headers and content types on the

## [0.3.0] - 2026-03-06

### Added

- Contact-form backend: Express API with validation, rate limiting and
- Content Security Policy and security headers, with the inline
- Hero entrance animations in CSS, and PurgeCSS for production

### Changed

- Removed `framer-motion` in favour of CSS
- Analytics deferred to `requestIdleCallback` so it never blocks first
- URLs normalized to the apex

## [0.2.0] - 2025-12-26

### Added

- SEO and performance pass: meta tags, lazy loading, AVIF/WebP
- Health route with a

### Changed

- Email handling moved to Resend, with improved error

## [0.1.0] - 2025-12-05

### Added

- Initial React portfolio: hero, about, experience, projects, skills,
- MIT licence and first

[Unreleased]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v4.1.0...HEAD
[4.1.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.6.4...v3.0.0
[2.6.4]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.6.3...v2.6.4
[2.6.3]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.6.2...v2.6.3
[2.6.2]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.6.1...v2.6.2
[2.6.1]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.6.0...v2.6.1
[2.6.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.4.4...v2.5.0
[2.4.4]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.4.3...v2.4.4
[2.4.3]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.4.2...v2.4.3
[2.4.2]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.4.1...v2.4.2
[2.4.1]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.3.1...v2.4.0
[2.3.1]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.4...v2.2.0
[2.1.4]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.6.0...v1.0.0
[0.6.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/syed-waleed-ahmed/Portfolio/releases/tag/v0.1.0
