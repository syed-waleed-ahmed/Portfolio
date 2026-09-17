# Architecture

Two independent workspaces in one repository, deployed to two platforms and
talking over a single HTTP endpoint.

```text
Browser
  |
  |  static assets (HTML / CSS / JS / fonts / images)
  v
Netlify CDN  <--  frontend/  (React 19 + Vite, prerendered to dist/)
  |
  |  POST /api/contact   (JSON, CORS-restricted)
  v
Render       <--  backend/   (Node + Express, ESM)
  |
  |  Resend SDK
  v
Resend  ->  inbox
```

There is no database and no session state. The only server-side work in the
whole system is validating a contact form and handing it to an email provider,
which is why the backend is a few hundred lines and the frontend is where the
complexity lives.

---

## Repository layout

```text
portfolio/
├── .github/
│   ├── workflows/ci.yml            Lint, build, test, audit, secret scan
│   ├── dependabot.yml              Grouped weekly dependency PRs
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
│   ├── config/env.js               Env parsing + boot-time validation
│   ├── routes/contactRoutes.js     Rate limit, honeypot, validation
│   ├── services/mailerService.js   Resend delivery + email templates
│   ├── test/contact.test.js        API tests (node --test)
│   ├── server.js                   App assembly; exports app, listens when run directly
│   └── .env.example
├── frontend/
│   ├── public/                     Static passthrough (see below)
│   ├── scripts/prerender.mjs       Writes the rendered page into dist/index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             Navbar, Footer (each with its .css)
│   │   │   ├── sections/           One file per page section, plus its .css
│   │   │   └── ui/                 Reusable primitives
│   │   ├── data/                   Portfolio content, no JSX
│   │   ├── styles/                 Layer order, tokens, reset, base, layout, shared components
│   │   ├── App.jsx
│   │   ├── entry-server.jsx        Build-time render entry
│   │   └── main.jsx                Hydrates the prerendered markup
│   ├── test/data.test.js           Content invariants (node --test)
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── .env.example
├── docs/                           This documentation set
├── postman/                        Collection + local and production envs
├── scripts/gen-og-card.mjs         Rebuilds the 1200x630 social card
├── .editorconfig  .gitattributes  .gitignore  .npmrc  .nvmrc
├── netlify.toml                    Pins NODE_VERSION for Netlify builds
└── package.json                    Root scripts that drive both workspaces
```

`frontend/public/` is copied verbatim into the build. It holds the branded
`404.html`, the Netlify `_headers` file, the self-hosted font, favicons, the
social card, `robots.txt`, `sitemap.xml`, `humans.txt`, the Search Console
verification file, and `sw.js` (a kill-switch service worker - see
[Deployment](deployment.md#stale-service-worker-recovery)).

---

## Frontend

### Layers

Every file has one obvious home, which is what keeps the tree navigable as
sections are added.

| Layer | What lives here | Examples |
|-------|-----------------|----------|
| `components/layout/` | Chrome that frames every page | `Navbar`, `Footer` |
| `components/sections/` | One file per visible section, with its stylesheet beside it | `Hero`, `About`, `Experience`, `Projects`, `Skills`, `Contact` |
| `components/ui/` | Reusable primitives, no domain coupling | `Reveal`, `SectionHeader`, `SectionLink`, `ExternalLink`, `ScrollToTop`, `SkipLink`, `ErrorBoundary` |
| `data/` | Pure content, no JSX | `about.js`, `experience.js`, `projects.js`, `skills.js`, `portfolio.js` |
| `styles/` | Global CSS in cascade layers | `index.css` (layer order), `tokens.css`, `reset.css`, `base.css`, `layout.css`, `components.css`, `utilities.css` |

### Data-driven content

Components are pure UI. All copy, links and figures live in `src/data/`, so
updating the site is a data edit rather than a JSX edit. See
[Development](development.md#updating-site-content) for the per-file guide.

`data/portfolio.js` exports `sections`, the ordered list of section ids and
labels. It is the single source for the navbar links and for the `<section>`
elements `App.jsx` renders, so a section cannot be added to one and forgotten
in the other. Each section is labelled by its heading, whose id is
`${sectionId}-title`.

The section headings are the exception to "one file per section owns its own
markup": all of them render through `components/ui/SectionHeader`, which takes
the heading id, the title and the subtitle. Sharing one component is what stops
the headings drifting apart as sections are edited independently.

`frontend/test/data.test.js` turns the data layer's conventions into checks:
every About figure must appear in the Experience or Projects entry it cites,
project copy stays within a shared length range, links are absolute `https`,
and no copy uses a character the font subset cannot draw.

### Import alias

`@` resolves to `frontend/src/` (configured in `vite.config.js`), so imports do
not encode folder depth:

```js
// good - identical wherever this file lives
import Reveal from "@/components/ui/Reveal";
import { projects } from "@/data/projects";

// bad - breaks the moment the file moves
import Reveal from "../../ui/Reveal";
```

### Rendering strategy

The page is **prerendered at build time**. `npm run build` runs three steps:

1. `vite build` produces the client bundle in `dist/`.
2. `vite build --ssr src/entry-server.jsx --outDir dist-server` compiles the
   app for Node.
3. `scripts/prerender.mjs` renders `<App />` to HTML once, writes it inside
   `<div id="root">` in `dist/index.html`, and deletes `dist-server/`.

The HTML response therefore already contains every heading, paragraph and
link. Text paints before any JavaScript runs, crawlers and link previews see
the full page, and anchors such as `/#projects` resolve against the real
document height. `main.jsx` then calls `hydrateRoot` to attach React to that
markup. The dev server has no prerender step and serves an empty root, so
`main.jsx` falls back to `createRoot` there.

Two consequences shape the components:

- **Render output must be deterministic.** Anything that differs between build
  time and the visitor's browser would fail hydration. The footer year, for
  example, is injected by Vite `define` as `__BUILD_YEAR__` rather than computed
  at render time.
- **Browser-only work belongs in effects.** `Reveal` hides below-the-fold
  content only after hydration, so the prerendered HTML is never invisible.

Sections are imported eagerly into a single bundle. With the content already in
the HTML there is nothing to gain from splitting a few kilobytes of section code
into separate requests. Each section has its own `ErrorBoundary`, so a render
error takes down that section rather than the page.

There is no animation library, no UI kit, no CSS framework and no PWA shell.

---

## Backend

Three layers, so `server.js` stays thin and each concern is testable on its own.

| Module | Responsibility |
|--------|----------------|
| `config/env.js` | Reads and normalizes `process.env` into one frozen `config` object; warns at boot about missing mail settings. Nothing else touches `process.env` |
| `routes/contactRoutes.js` | Rate limiting, honeypot check, field validation. Knows nothing about email |
| `services/mailerService.js` | HTML escaping, mail-header sanitization, template rendering, Resend delivery. Knows nothing about HTTP |
| `server.js` | Middleware assembly, health routes, 404, centralized error handler, graceful shutdown |

The service layer signals failure with two typed errors, `MailerNotConfiguredError`
and `EmailDeliveryError`, which the route maps to `503` and `502`. Anything else
is forwarded to the central error handler, which logs the full error and returns
a generic message. The boundary is what keeps provider details out of HTTP
responses.

`server.js` exports the Express app and only calls `listen()` when executed
directly, which is what lets the test suite bind an ephemeral port instead of
fighting over 5000.

### Contact form request flow

1. The browser POSTs the form (including the empty `website` honeypot) to
   `/api/contact`.
2. Helmet sets security headers.
3. CORS checks the `Origin` against the allow-list. A disallowed origin gets a
   response with no `Access-Control-Allow-Origin`, which the browser blocks.
4. `express.json({ limit: "16kb" })` parses the body, or rejects it with `413`.
   This runs **before** the router, so oversized payloads cost no rate-limit
   quota.
5. `express-rate-limit` checks the client IP: 5 requests per 15 minutes.
6. The honeypot check runs. A filled `website` field returns the same `200` a
   real send produces, logs the sender, and stops.
7. Validation enforces presence, length caps and the email pattern, returning
   `400` on the first failure.
8. `mailerService` escapes the values, strips control characters from
   header-bound fields, renders the HTML and plain-text parts, and sends via
   Resend with the submitter's address as `Reply-To`.
9. Failures map to `503` (unconfigured) or `502` (delivery rejected). Anything
   unexpected reaches the central handler as a `500`.

Status codes and payloads for each step are documented in the
[API reference](api.md#post-apicontact).

---

## Cross-cutting decisions

**One Node version, one source of truth.** `.nvmrc` pins it; CI reads it via
`node-version-file`, `netlify.toml` mirrors it, and both `package.json` files
declare a matching `engines.node`. `.npmrc` sets `engine-strict=true` so a
mismatched local install fails loudly instead of producing confusing runtime
errors.

**The build has no environment-dependent steps.** There is no PostCSS
configuration and no CSS purging, so `npm run build` produces the same output
locally, in CI and on Netlify with no variables set.

**Secrets never reach the client.** The Resend key lives only in the backend
environment. The frontend's only configurable value is the API base URL, and
`VITE_`-prefixed variables are compiled into the bundle by design - never put
anything sensitive there.

---

## Related documents

- [API reference](api.md)
- [Design system](design.md)
- [Development](development.md)
- [Deployment](deployment.md)
- [Security](security.md)
- [Testing](testing.md)
