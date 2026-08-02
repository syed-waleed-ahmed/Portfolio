# Architecture

Two independent workspaces in one repository, deployed to two platforms and
talking over a single HTTP endpoint.

```text
Browser
  |
  |  static assets (HTML / CSS / JS / fonts / images)
  v
Netlify CDN  <--  frontend/  (React 19 + Vite, built to dist/)
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
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             Navbar, Footer
│   │   │   ├── sections/           One file per page section
│   │   │   └── ui/                 Reusable primitives
│   │   ├── data/                   Portfolio content, no JSX
│   │   ├── hooks/useInView.js      IntersectionObserver wrapper
│   │   ├── styles/                 reset, base, navbar, hero, components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── postcss.config.js
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
| `components/sections/` | One file per visible section | `Hero`, `About`, `Projects`, `Contact` |
| `components/ui/` | Reusable primitives, no domain coupling | `Reveal`, `ScrollProgress`, `ScrollToTop`, `SkipLink`, `ErrorBoundary`, `LazyMountSection` |
| `hooks/` | Cross-cutting React hooks | `useInView`, used by `Reveal` and `LazyMountSection` |
| `data/` | Pure content, no JSX | `about.js`, `experience.js`, `projects.js`, `skills.js`, `interests.js`, `portfolio.js` |
| `styles/` | Global CSS: reset, tokens, layout, components | `reset.css`, `base.css`, `navbar.css`, `hero.css`, `components.css` |

### Data-driven content

Components are pure UI. All copy, links and figures live in `src/data/`, so
updating the site is a data edit rather than a JSX edit. See
[Development](development.md#updating-site-content) for the per-file guide.

Icons are stored as **string keys**, not components (`icon: "rag"`). Each
section maps the key to a `react-icons` component through a lookup at the top
of the file. That is what keeps JSX out of the data layer; a key with no entry
in the map renders nothing rather than crashing, so a typo costs a glyph, not
the section.

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

The hero renders immediately. Everything below the fold is wrapped in
`LazyMountSection`, which mounts on `requestIdleCallback` after first paint, and
in `Reveal`, which animates on an `IntersectionObserver` entry. Both are backed
by the same `useInView` hook, and both honour `prefers-reduced-motion`.

Section chunks are code-split, so first paint downloads the hero and the shell
rather than the whole page. An `ErrorBoundary` wraps the below-fold sections,
so a crash in one degrades that section instead of blanking the site.

There is no animation library, no PWA shell and no Bootstrap JS. Bootstrap is
used for its CSS grid and utilities only, and PurgeCSS trims the unused ones in
production builds.

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

**Production builds are gated on `NODE_ENV`.** `postcss.config.js` only enables
PurgeCSS when `NODE_ENV=production`, so a build without it ships all of
Bootstrap. CI sets it explicitly for that reason.

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
