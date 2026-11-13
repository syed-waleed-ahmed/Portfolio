# Syed Waleed Ahmed - Portfolio

[![Syed Waleed Ahmed, AI Engineer: multi-agent systems, RAG pipelines and LLM workflow automation](frontend/public/images/og-card.png)](https://syedwaleedahmed.me/)

[![CI](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/ci.yml)
[![Link check](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/links.yml/badge.svg)](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/links.yml)
[![Release](https://img.shields.io/github/v/release/syed-waleed-ahmed/Portfolio)](https://github.com/syed-waleed-ahmed/Portfolio/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24.5-brightgreen.svg)](.nvmrc)
[![Live](https://img.shields.io/badge/live-syedwaleedahmed.me-0a7cff.svg)](https://syedwaleedahmed.me/)

The source of my personal site: an AI engineer's portfolio covering experience,
projects and skills, with a working contact form. It is built with
**React 19 + Vite** on the frontend and **Node.js + Express** on the backend,
and the form delivers email through Resend.

**Live:** https://syedwaleedahmed.me/

**Contents:** [Why this exists](#why-this-exists) ·
[Features](#features) · [Architecture](#architecture) ·
[Tech stack](#tech-stack) · [Repository structure](#repository-structure) ·
[Quick start](#quick-start) · [Configuration](#configuration) ·
[Usage](#usage) · [API](#api-overview) ·
[Development workflow](#development-workflow) · [Testing](#testing) ·
[Deployment](#deployment) · [Documentation](#documentation) ·
[Troubleshooting](#troubleshooting) · [Roadmap](#roadmap) ·
[Contributing](#contributing) · [Security](#security) ·
[Contact](#contact) · [License](#license)

---

## Why this exists

A portfolio is usually the first engineering artifact anyone sees, and most are
either a template with the names swapped out or a heavyweight build that takes
several seconds to paint on a phone. This one is written to be read as a work
sample: a prerendered page with no CSS framework, animation library or UI kit,
a small hardened API rather than a third-party form widget, accessibility and
caching handled deliberately, and documentation that explains the decisions
rather than restating the code.

The constraints that follow from that: ship as little JavaScript as possible,
keep every visual value in one token system, treat the contact endpoint as a
public API that will be abused, and keep the docs accurate enough that someone
forking the repository can run it without reading the source.

---

## Features

**Frontend**

- Prerendered at build time and hydrated on load, so the full page is in the
  HTML response and text paints before any JavaScript runs
- Lean output: about 8 KB of gzipped CSS and 85 KB of gzipped JS on load, held
  there by size budgets in CI, with no CSS framework, animation library, UI kit
  or PWA shell
- A Ctrl/Cmd+K command palette ([cmdk](https://github.com/pacocoursey/cmdk)), a
  GitHub contribution graph
  ([react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar))
  and a globe ([cobe](https://github.com/shuding/cobe)), each a separate chunk
  fetched only when it is wanted
- Brand marks on the skill tags, from
  [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0) and
  [Lobe Icons](https://github.com/lobehub/lobe-icons) (MIT), built into one
  cached SVG sprite so they add nothing to the JavaScript or the HTML
- Modern CSS architecture: cascade layers, design tokens, native nesting,
  fluid `clamp()` type, container queries, `subgrid`, `:has()`, animated
  `<details>` and a scroll-driven reading-progress line, with styles co-located
  beside each component
- A floating dock, expandable work rows, a blur-fade entrance and a light that
  follows the pointer across the project cards, adapted from
  [magicuidesign/portfolio](https://github.com/magicuidesign/portfolio) and
  [magicui](https://github.com/magicuidesign/magicui) (both MIT) and rewritten
  in plain CSS with no new dependencies
- A picture on every project card, cropped from that project's own repository
  and served as lazy AVIF at two widths
- Data-driven content: entries, figures and links live in `src/data/`, with
  content tests that keep figures traceable and entries consistent
- Accessibility: skip link, named landmarks, one focus style, an accessible
  dock and form, reduced motion honoured, 48px tap targets on touch screens;
  an axe-core WCAG 2.2 A/AA scan of the built page runs in CI
- Responsive from 320px up with no horizontal scroll, and a branded 404 page
- An error boundary per section
- SEO: canonical URL, `Person` + `WebSite` + `ProfilePage` JSON-LD, OG and
  Twitter cards, sitemap, `robots.txt`, `humans.txt`
- One self-hosted variable font with a metric-matched fallback, so no
  third-party request on the critical path and no layout shift on swap

**Backend**

- Layered Express service: `config/` to `routes/` to `services/`
- Helmet security headers, rate limiting, a 16 KB body cap, trust-proxy, a
  centralized error handler that answers malformed bodies with a `400` rather
  than a `500`, and graceful shutdown
- Honeypot spam trap that answers indistinguishably from a real send
- HTML escaping and mail-header sanitization on every user-supplied value, and
  a URL-encoded address in the email's `mailto:` links
- Branded HTML and plain-text email templates

**Engineering**

- 18 backend API tests, 14 frontend content tests and 16 repository invariants
  on Node's built-in runner, with no test dependencies; the invariants pin the
  couplings between files that would otherwise fail silently, such as the CSP
  hash and the hand-copied palette
- 22 browser tests in Playwright, with axe-core, against the built site under
  its production CSP
- Size Limit budgets on the entry bundle and each lazy chunk
- Postman collection covering every endpoint: validation, the body cap,
  malformed JSON, the honeypot, the rate limiter, CORS and the 404s
- CI runs lint, the content tests, the invariants, a build, the size budgets,
  the browser suite, the backend tests, `npm audit` and a gitleaks scan on
  every push to `main` and every pull request against it
- Netlify's build runs frontend lint, the content tests and the invariants
  first, so a commit that fails them never replaces the live site
- Every GitHub Action pinned to a commit SHA; Dependabot opens grouped weekly
  PRs for minor and patch releases and for GitHub Actions, after a seven-day
  cooldown, and npm majors are upgraded by hand after reading the changelog
- A scheduled workflow refreshes the contribution graph's snapshot every Monday,
  and another checks every link in the site's data and the docs
- One pinned Node version shared by local, CI and Netlify

---

## Architecture

```text
Browser  --  page and assets  -->  Netlify CDN (frontend/, prerendered build)
   |
   |  POST /api/contact, cross-origin with CORS
   v
Render (backend/, Express)  -->  Resend  -->  inbox
```

No database, no authentication, no user state. The frontend is a static build;
the only server-side work in the system is validating a contact submission and
handing it to an email provider.

Full detail in [`docs/architecture.md`](docs/architecture.md).

---

## Tech stack

| Layer | Choices |
|-------|---------|
| Frontend | React 19 (prerendered, hydrated), Vite 8, plain CSS in cascade layers, `react-icons`, and lazily loaded `cmdk`, `react-activity-calendar`, `cobe` |
| Backend | Node.js 24, Express 5 (ESM), Helmet, `express-rate-limit`, Resend |
| Quality | ESLint 10, `node --test`, Playwright + axe-core, Size Limit, Postman |
| CI/CD | GitHub Actions, Dependabot, gitleaks, lychee |
| Hosting | Netlify (frontend), Render (backend) |

---

## Repository structure

```text
portfolio/
├── .github/          Workflows, Dependabot, issue forms, PR template, CODEOWNERS
├── backend/          Express API (config, routes, services, tests), with its own README
├── frontend/         React app (components, data, styles, scripts, public, tests), with its own README
├── docs/             Documentation set, indexed in docs/README.md and below
├── postman/          API collection and environments
├── scripts/          One-off generators (social card)
├── test/             Repository invariants, across both projects
├── lychee.toml       Link-check configuration
└── netlify.toml      Node version pin for Netlify builds
```

Annotated version in
[`docs/architecture.md`](docs/architecture.md#repository-layout).

---

## Quick start

Requires Node `^22.19.0 || ^24.5.0 || >=26.0.0` (`.nvmrc` pins 24; run `nvm use`).

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
npm run install:all

cp backend/.env.example backend/.env      # fill in Resend values
cp frontend/.env.example frontend/.env    # optional API override

npm run dev:backend      # http://localhost:5000
npm run dev:frontend     # http://localhost:5173
```

Without Resend credentials everything still runs; the contact endpoint returns
`503` instead of sending. The copied `frontend/.env` sets
`VITE_API_BASE_URL=http://localhost:5000`, which points the form at your local
backend; without the file, the form calls the production API. Vite bakes the
value into every build, and the browser tests refuse one that calls localhost
(see [Troubleshooting](#troubleshooting)).

### Scripts

| Script | What it does |
|--------|--------------|
| `npm run install:all` | Install both projects |
| `npm run dev:frontend` | Vite dev server on port 5173 |
| `npm run dev:backend` | Express with `node --watch` on port 5000 |
| `npm run build` | Frontend lint, content tests and invariants, then the production build into `frontend/dist/` |
| `npm run lint` | ESLint over the frontend and the backend |
| `npm test` | Backend API test suite |
| `npm run test:invariants` | Repository invariants |
| `npm start` | Backend without the file watcher, as Render starts it |

`frontend/` adds `npm test` (content tests), `npm run size` (bundle budgets) and
`npm run test:e2e` (browser tests), the last two against an existing build.

---

## Configuration

`backend/.env` - `RESEND_API_KEY`, `EMAIL_FROM` and `EMAIL_TO` are required for
delivery; `PORT`, `NODE_ENV` and `ALLOWED_ORIGINS` are optional.

`frontend/.env` - `VITE_API_BASE_URL` only, and it is compiled into the public
bundle, so never put a secret there.

Every variable is described in
[`docs/development.md`](docs/development.md#configuration), and both
`.env.example` files are annotated templates.

---

## Usage

### Updating site content

Entries, figures and links live in `frontend/src/data/`; only the hero text,
section subtitles and contact panel text are written in their components.
Adding a project is a data edit, not a component edit:

```js
// frontend/src/data/projects.js
export const projects = [
  {
    title: "Project name",
    role: "Your role",
    description: "What it does.",
    highlight: "The one thing worth noticing.",
    stack: ["React", "Node", "Express", "Resend"],
    github: "https://github.com/…",   // or sourceNote, never both
    demo: "https://…",                // optional, needs github
  },
  // …
];
```

Each card carries exactly one of `github`, which draws a "View source" link at
the foot of the card, or `sourceNote`, a short line saying why there is no
public repository (for example "Private repository"). A card with a running
deployment adds `demo`, a "Live demo" link beside "View source" that the
command palette also lists as its own entry. The content tests fail on a card
with neither or both, or with a `demo` and no `github`, and hold descriptions,
highlights and stacks to the same density as the other cards. There is no
ordering or emphasis flag - array order is page order.

The same pattern applies to `experience.js`, `skills.js`, `about.js` and
`portfolio.js`, and the command palette builds its entries from these files, so
new content reaches it without being listed again. See
[`docs/development.md`](docs/development.md#updating-site-content) for the
per-file guide and the rules that keep the data layer honest.

### Calling the API

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","subject":"Hello","message":"Hi there."}'
```

```json
{ "success": true, "message": "Message sent successfully." }
```

---

## API overview

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/` | Root probe |
| `GET` | `/health` | Health check with server time |
| `POST` | `/api/contact` | Submit the contact form |

`POST /api/contact` takes `name`, `email`, `subject` and `message`, is limited
to 5 requests per IP per 15 minutes, caps the body at 16 KB, and returns `400`
on validation failure or malformed JSON, `413` on an oversized body, `415` on
an unsupported charset or encoding, `429` when limited, `502` when Resend
rejects the send or cannot be reached, and `503` when the mailer is
unconfigured.

Full contract, including the honeypot and CORS behaviour, in
[`docs/api.md`](docs/api.md). Runnable requests in
[`postman/`](postman/README.md).

---

## Development workflow

Branch from `main`, keep the change focused, update the docs alongside the
behaviour, and run the checks that apply:

```bash
npm run lint                         # frontend and backend
npm test --prefix frontend           # content changes
npm run test:invariants              # any change
npm run build                        # frontend changes; runs frontend lint and the two above first
npm run size --prefix frontend       # frontend changes, after the build
npm run test:e2e --prefix frontend   # UI changes, after a build that calls the production API
npm test                             # backend changes
```

CI runs the same checks plus `npm audit` and a gitleaks scan on every push to
`main` and every pull request against it. Conventions, commit format and review
expectations are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Testing

```bash
npm test                             # 18 backend API tests via node --test
npm test --prefix frontend           # 14 content tests over frontend/src/data
npm run test:invariants              # 16 checks that files which must agree still do
npm run size --prefix frontend       # bundle budgets, after a build
npm run test:e2e --prefix frontend   # 22 browser tests, after a build
```

The API suite binds an ephemeral port and covers both health probes, all three
validation paths, the 16 KB cap, malformed JSON, the honeypot answering exactly
as a real send, CORS, the rate limiter and the 404 catch-all. A second file
sends through a fake Resend and checks the mail itself: the owner as recipient,
the sender as `Reply-To`, a reply link the address cannot add parameters to,
and a plain-text part no field can add lines to. Neither can send real email,
whatever `backend/.env` holds: one blanks the mail settings before importing
the app, the other points the SDK at the reserved `.invalid` domain and
answers it itself. Importing the app is itself a check that every module loads.

The frontend content tests keep every About figure traceable to the entry that
claims it, hold project and experience copy to a shared length range, give
every project card exactly one of a source link or a note, require every
external link to be absolute `https` and every key and section id to be
unique, and fail on any character in the data modules that the self-hosted
font subset cannot draw. They also check that every command palette entry
points somewhere real, that its search finds the right entry, and that the
activity snapshot is a usable year of days.

The repository invariants pin what used to fail silently, among them the CSP
hash of the inline analytics script, the six hand-copied palettes, the form
rules mirrored between frontend and backend, the API origin the CSP must
allow, the hand-kept dates, the Node version, the release version in all three
manifests and the no-em-dash house style. The browser suite runs the built
page in Chromium under its production CSP, with the backend and analytics
answered inside the test: no console or CSP errors, every section revealed, no
horizontal scroll from 320px to 1920px, no axe violations, and the command
palette, the dock's Home link, the contact form, the graph's fit on a phone and
printing each checked in turn.

Live and manual testing uses the Postman collection in
[`postman/`](postman/README.md), which runs the same paths against a real
server, including the CORS preflights and the wrong method. It can be imported
straight from GitHub without cloning.
A weekly workflow checks every link in the site's data and the docs. Details in
[`docs/testing.md`](docs/testing.md).

---

## Deployment

Both sides deploy automatically from `main`:

| Part | Platform | Build |
|------|----------|-------|
| Frontend | Netlify | `npm run build` in `frontend/`, publish `frontend/dist` |
| Backend | Render | `npm ci` then `npm start` in `backend/` |

The frontend build prerenders the page, so a build that fails to render fails
the deploy rather than publishing an empty page, and it runs frontend lint, the
content tests and the invariants first, so a commit that fails them leaves the
previous deploy live. Render has no such gate. Platform settings, security headers, the
CSP hash procedure and cache rules are in
[`docs/deployment.md`](docs/deployment.md).

---

## Documentation

| Document | Covers |
|----------|--------|
| [Architecture](docs/architecture.md) | System shape, repository layout, frontend layers, backend modules, request flow |
| [API reference](docs/api.md) | Endpoints, payloads, status codes, rate limiting, CORS |
| [Development](docs/development.md) | Setup, scripts, configuration, conventions, troubleshooting |
| [Design system](docs/design.md) | CSS architecture, tokens, typography, layout, the dock, command palette, activity graph and globe, motion, accessibility, print, generated assets |
| [Deployment](docs/deployment.md) | Netlify and its build gate, Render, CI, the weekly snapshot commit and link check, headers, CSP, caching, releases |
| [Testing](docs/testing.md) | API, content, invariant and browser suites, size budgets, link check, Postman collection, coverage gaps |
| [Security controls](docs/security.md) | What is implemented and why |
| [Postman](postman/README.md) | Importing and running the API collection |
| [Contributing](CONTRIBUTING.md) | What is welcome, workflow, commit format |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community expectations |
| [Security policy](SECURITY.md) | Reporting a vulnerability |
| [Changelog](CHANGELOG.md) | Release history |

---

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| `EBADENGINE` on install | Node outside `^22.19.0 \|\| >=24.5.0`. Run `nvm use` |
| `npm run build` stops before Vite | The prebuild gate: lint, a content test or an invariant failed, and the output names it |
| `npm run test:e2e` refuses the build | It was built with `VITE_API_BASE_URL` pointing away from production, as `frontend/.env` does. Rebuild with it set to the production origin; the error prints the command |
| Contact form returns `503` | `RESEND_API_KEY`, `EMAIL_FROM` or `EMAIL_TO` missing. The boot log names them |
| Contact form returns `502` | Resend rejected the send or could not be reached, usually an unverified `EMAIL_FROM` |
| CORS error in the browser | Your origin is not on the allow-list. Set `ALLOWED_ORIGINS` to include it, along with every default you still need |
| Works in Postman, not the browser | Same cause: Postman sends no `Origin` header |
| `429 Too many requests` | 5 per IP per 15 minutes. Restart the backend to clear the counter |
| Hydration error in the console | Something renders differently at build time than in the browser. Move it into an effect |
| Analytics stopped after editing `index.html` | The inline snippet is CSP hash-pinned. Recompute the hash; `npm run test:invariants` prints it |

Longer explanations for each in
[`docs/development.md`](docs/development.md#troubleshooting).

---

## Roadmap

Not a committed plan, just what is queued:

- Delete `frontend/public/sw.js` once analytics show no service-worker traffic
  for about 30 days
- Frontend component tests, if the UI grows more stateful logic than the
  contact form and the command palette
- An uptime pinger against `/health` to remove Render free-tier cold starts

Known testing gaps are listed in [`docs/testing.md`](docs/testing.md#gaps), and
deliberate security non-goals in
[`docs/security.md`](docs/security.md#deliberate-non-goals).

---

## Contributing

Bug reports, accessibility and performance fixes, and documentation
corrections are welcome. Content and redesign PRs are not - see
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the full scope and workflow.
Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately rather than in a public issue. The
policy, scope and safe-harbour terms are in [`SECURITY.md`](SECURITY.md); the
controls already in place are inventoried in
[`docs/security.md`](docs/security.md).

## Contact

The quickest route is the [contact form](https://syedwaleedahmed.me/#contact)
on the site. You can also email
[syedwaleedahmed9@gmail.com](mailto:syedwaleedahmed9@gmail.com) or reach me on
[LinkedIn](https://www.linkedin.com/in/syed-waleed-ahmed/). The resume is
linked from the site's dock.

## License

MIT - see [LICENSE](LICENSE). You are welcome to fork this for your own
portfolio; replace the content in `frontend/src/data/`, the hero text in
`Hero.jsx`, the images in `frontend/public/` and the copies listed under
[Facts stated twice](docs/development.md#facts-stated-twice), set
`githubUsername` in `portfolio.js`, and run
`node frontend/scripts/fetch-github-activity.mjs` to replace the contribution
snapshot.

The brand marks in `frontend/src/assets/skill-icons.svg` are not covered by
that licence. They come from Simple Icons (CC0-1.0) and Lobe Icons (MIT), and
each remains a trademark of its owner, shown here only to name the tool beside
it.
