# Syed Waleed Ahmed - Portfolio

[![CI](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/syed-waleed-ahmed/Portfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.13-brightgreen.svg)](.nvmrc)
[![Live](https://img.shields.io/badge/live-syedwaleedahmed.me-0a7cff.svg)](https://syedwaleedahmed.me/)

A personal portfolio site built with **React 19 + Vite** on the frontend and
**Node.js + Express** on the backend, with a working contact form that delivers
email through Resend.

**Live:** https://syedwaleedahmed.me/

---

## Why this exists

A portfolio is usually the first engineering artifact anyone sees, and most are
either a template with the names swapped out or a heavyweight build that takes
several seconds to paint on a phone. This one is written to be read as a work
sample: a prerendered page with no CSS framework, animation library or UI kit, a small hardened
API rather than a third-party form widget, accessibility and caching handled
deliberately, and documentation that explains the decisions rather than
restating the code.

The constraints that follow from that: ship as little JavaScript as possible,
keep every visual value in one token system, treat the contact endpoint as a
public API that will be abused, and keep the docs accurate enough that someone
forking the repository can run it without reading the source.

---

## Features

**Frontend**

- Prerendered at build time and hydrated on load, so the full page is in the
  HTML response and text paints before any JavaScript runs
- Lean output: about 6 KB of gzipped CSS and 81 KB of gzipped JS, with no CSS
  framework, animation library, UI kit or PWA shell
- Modern CSS architecture: cascade layers, design tokens, native nesting,
  fluid `clamp()` type, container queries, `subgrid` and a scroll-driven
  reading-progress line, with styles co-located beside each component
- Data-driven content: all copy lives in `src/data/`, with content tests that
  keep figures traceable and entries consistent
- Accessibility: skip link, named landmarks, one focus style, an accessible
  mobile menu and form, reduced motion honoured, 44-48px tap targets; the built
  page passes an axe-core WCAG 2.2 AA scan
- Responsive from 320px up with no horizontal scroll, and a branded 404 page
- An error boundary per section
- SEO: canonical URL, `Person` + `WebSite` + `ProfilePage` JSON-LD, OG and
  Twitter cards, sitemap, `robots.txt`, `humans.txt`
- One self-hosted variable font with a metric-matched fallback, so no
  third-party request on the critical path and no layout shift on swap

**Backend**

- Layered Express service: `config/` to `routes/` to `services/`
- Helmet security headers, rate limiting, a 16 KB body cap, trust-proxy, a
  centralized error handler and graceful shutdown
- Honeypot spam trap that answers indistinguishably from a real send
- HTML escaping and mail-header sanitization on every user-supplied value
- Branded HTML and plain-text email templates

**Engineering**

- 9 backend API tests and 7 frontend content tests on Node's built-in runner,
  no test dependencies
- Postman collection covering every endpoint and every error path
- CI runs lint, build, tests, `npm audit` and a gitleaks scan on every push
- Dependabot opens grouped weekly dependency PRs
- One pinned Node version shared by local, CI and Netlify

---

## Architecture

```text
Browser  ->  Netlify CDN (frontend/, static build)
                  |
                  |  POST /api/contact
                  v
             Render (backend/, Express)
                  |
                  v
             Resend  ->  inbox
```

No database, no authentication, no user state. The frontend is a static build;
the only server-side work in the system is validating a contact submission and
handing it to an email provider.

Full detail in [`docs/architecture.md`](docs/architecture.md).

---

## Tech stack

| Layer | Choices |
|-------|---------|
| Frontend | React 19 (prerendered, hydrated), Vite 8, plain CSS in cascade layers, `react-icons` |
| Backend | Node.js 24, Express 5 (ESM), Helmet, `express-rate-limit`, Resend |
| Testing | `node --test`, Postman |
| CI/CD | GitHub Actions, Dependabot, gitleaks |
| Hosting | Netlify (frontend), Render (backend) |

---

## Repository structure

```text
portfolio/
├── .github/          CI workflow, Dependabot config, PR template
├── backend/          Express API (config, routes, services, tests)
├── frontend/         React app (components, data, hooks, styles, public)
├── docs/             Documentation set - see the index below
├── postman/          API collection and environments
├── scripts/          One-off generators (social card)
└── netlify.toml      Node version pin for Netlify builds
```

Annotated version in
[`docs/architecture.md`](docs/architecture.md#repository-layout).

---

## Quick start

Requires Node 22.13 or newer (`.nvmrc` pins 24; run `nvm use`).

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
`503` instead of sending. Set `VITE_API_BASE_URL=http://localhost:5000` in
`frontend/.env` to point the form at your local backend rather than production.

### Scripts

| Script | What it does |
|--------|--------------|
| `npm run install:all` | Install both workspaces |
| `npm run dev:frontend` | Vite dev server on port 5173 |
| `npm run dev:backend` | Express with `node --watch` on port 5000 |
| `npm run build` | Production build into `frontend/dist/` |
| `npm run lint` | ESLint over the frontend |
| `npm test` | Backend API test suite |
| `npm start` | Backend in production mode |

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

All copy lives in `frontend/src/data/`. Adding a project is a data edit, not a
component edit:

```js
// frontend/src/data/projects.js
export const projects = [
  {
    title: "Project name",
    role: "Your role",
    description: "What it does.",
    highlight: "The one thing worth noticing.",
    stack: ["React", "Node"],
    github: "https://github.com/…",   // optional
  },
  // …
];
```

Listed in render order. `github` is the only optional field: supplied, it
draws a "View source" link at the foot of the card; omitted, nothing renders in
its place. There is no ordering or emphasis flag - array order is page order.

The same pattern applies to `experience.js`, `skills.js`, `about.js` and
`portfolio.js`. See
[`docs/development.md`](docs/development.md#updating-site-content) for the
per-file guide and the rules that keep the data layer honest.

### Calling the API

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","subject":"Hello","message":"Hi there."}'
```

```json
{ "success": true, "message": "Message sent successfully.", "id": "8f1b…" }
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
on validation failure, `413` on an oversized body, `429` when limited, `502` on
a rejected send and `503` when the mailer is unconfigured.

Full contract, including the honeypot and CORS behaviour, in
[`docs/api.md`](docs/api.md). Runnable requests in
[`postman/`](postman/README.md).

---

## Development workflow

Branch from `main`, keep the change focused, update the docs alongside the
behaviour, and run the checks that apply:

```bash
npm run lint                   # frontend changes
npm test --prefix frontend     # content changes
npm run build                  # frontend changes
npm test                       # backend changes
```

CI runs the same commands plus `npm audit` and a gitleaks scan on every push
and pull request. Conventions, commit format and review expectations are in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Testing

```bash
npm test                     # 9 backend API tests via node --test
npm test --prefix frontend   # 7 content tests over frontend/src/data
```

The suite binds an ephemeral port, covers both health probes, all three
validation paths, the 16 KB cap, both honeypot branches and the 404 catch-all,
and never sends real email - so it passes with or without Resend configured.
Importing the app is itself a check that every module loads.

The frontend content tests keep every About figure traceable to the entry that
claims it, hold project and experience copy to a shared length range, and fail
on any character the self-hosted font subset cannot draw.

Live and manual testing uses the Postman collection in [`postman/`](postman/),
which additionally covers the rate limiter, the CORS preflight and the wrong
method. It can be imported straight from GitHub without cloning. Details in
[`docs/testing.md`](docs/testing.md).

---

## Deployment

Both sides deploy automatically from `main`:

| Part | Platform | Build |
|------|----------|-------|
| Frontend | Netlify | `npm run build` in `frontend/`, publish `frontend/dist` |
| Backend | Render | `npm ci` then `npm start` in `backend/` |

The frontend build prerenders the page, so a build that fails to render fails
the deploy rather than publishing an empty page. Platform settings, security
headers, the CSP hash procedure and cache rules are in
[`docs/deployment.md`](docs/deployment.md).

---

## Documentation

| Document | Covers |
|----------|--------|
| [Architecture](docs/architecture.md) | System shape, repository layout, frontend layers, backend modules, request flow |
| [API reference](docs/api.md) | Endpoints, payloads, status codes, rate limiting, CORS |
| [Development](docs/development.md) | Setup, scripts, configuration, conventions, troubleshooting |
| [Design system](docs/design.md) | CSS architecture, tokens, typography, layout, motion, accessibility, generated assets |
| [Deployment](docs/deployment.md) | Netlify and Render, CI, headers, CSP, caching, releases |
| [Testing](docs/testing.md) | Automated suite, Postman collection, coverage gaps |
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
| `EBADENGINE` on install | Node below 22.13. Run `nvm use` |
| Contact form returns `503` | `RESEND_API_KEY`, `EMAIL_FROM` or `EMAIL_TO` missing. The boot log names them |
| Contact form returns `502` | Resend rejected the send, usually an unverified `EMAIL_FROM` |
| CORS error in the browser | Your origin is not on the allow-list. Add it to `ALLOWED_ORIGINS` |
| Works in Postman, not the browser | Same cause: Postman sends no `Origin` header |
| `429 Too many requests` | 5 per IP per 15 minutes. Restart the backend to clear the counter |
| Hydration error in the console | Something renders differently at build time than in the browser. Move it into an effect |
| Analytics stopped after editing `index.html` | The inline snippet is CSP hash-pinned. Recompute the hash |

Longer explanations for each in
[`docs/development.md`](docs/development.md#troubleshooting).

---

## Roadmap

Not a committed plan, just what is queued:

- Delete `frontend/public/sw.js` once analytics show no service-worker traffic
  for about 30 days
- Frontend component tests, if the UI grows more stateful logic than the
  contact form
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

## License

MIT - see [LICENSE](LICENSE). You are welcome to fork this for your own
portfolio; replace the content in `frontend/src/data/` and the images in
`frontend/public/`.
