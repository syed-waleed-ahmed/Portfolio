# Architecture

Two independent npm projects in one repository, deployed to two platforms and
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
│   ├── workflows/ci.yml            Lint, tests, invariants, build, size, browser tests, audit, secret scan
│   ├── workflows/links.yml         Weekly link check (lychee)
│   ├── workflows/refresh-activity.yml  Weekly commit of the contribution snapshot
│   ├── dependabot.yml              Grouped weekly dependency PRs
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
│   ├── config/env.js               Env parsing + boot-time validation
│   ├── routes/contactRoutes.js     Rate limit, validation, honeypot
│   ├── services/mailerService.js   Resend delivery + email templates
│   ├── test/contact.test.js        API tests (node --test)
│   ├── server.js                   App assembly; exports app, listens when run directly
│   ├── eslint.config.js            Lint rules for Node
│   └── .env.example
├── frontend/
│   ├── public/                     Static passthrough (see below)
│   ├── scripts/prerender.mjs       Writes the rendered page into dist/index.html
│   ├── scripts/fetch-github-activity.mjs  Refreshes the contribution snapshot
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             Masthead, Dock, CommandMenu, Footer
│   │   │   ├── sections/           Page sections and the parts they mount, each with its .css if it has styles
│   │   │   └── ui/                 Reusable primitives
│   │   ├── data/                   Portfolio content, no JSX
│   │   ├── styles/                 Layer order, tokens, reset, base, layout, shared components
│   │   ├── App.jsx
│   │   ├── entry-server.jsx        Build-time render entry
│   │   └── main.jsx                Hydrates the prerendered markup
│   ├── test/data.test.js           Content tests (node --test)
│   ├── e2e/site.spec.js            Browser tests (Playwright + axe)
│   ├── e2e/serve.mjs               Serves dist/ with its real CSP for those tests
│   ├── playwright.config.js
│   ├── .size-limit.json            Gzip budgets for the entry and each lazy chunk
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── .env.example
├── docs/                           This documentation set
├── postman/                        Collection + local and production envs
├── scripts/gen-og-card.mjs         Rebuilds the 1200x630 social card
├── test/invariants.test.js         Repository invariants: files that must agree (node --test)
├── .editorconfig  .gitattributes  .gitignore  .npmrc  .nvmrc
├── lychee.toml                     Link checker configuration
├── netlify.toml                    Pins NODE_VERSION for Netlify builds
└── package.json                    Root scripts that drive both projects
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
| `components/layout/` | Chrome that frames every page | `Masthead`, `Dock`, `CommandMenu`, `Footer` |
| `components/sections/` | One file per visible section, with its stylesheet beside it | `Hero`, `About`, `Experience`, `Projects`, `Skills`, `Contact`, and the parts they mount: `GitHubActivity`, `LocationGlobe` |
| `components/ui/` | Reusable primitives, no domain coupling | `Reveal`, `SectionHeader`, `SectionLink`, `ExternalLink`, `Monogram`, `SkipLink`, `ErrorBoundary`, `CommandPalette`, and two helpers: `scrollToSection`, which `SectionLink` and the palette share, and `commandShortcut`, the Ctrl/Cmd+K test the dock's Search item and the palette share |
| `data/` | Pure content, no JSX | `about.js`, `experience.js`, `projects.js`, `skills.js`, `portfolio.js`, `commands.js` (built from the others), `github-activity.json` (generated) |
| `styles/` | Global CSS in cascade layers | `index.css` (layer order), `tokens.css`, `reset.css`, `base.css`, `layout.css`, `components.css`, `utilities.css` |

### Data-driven content

Entries, figures and links live in `src/data/`, so adding a project, a role or
a skill is a data edit rather than a JSX edit. The exceptions are prose tied to
one component: the hero's headline, lead and graduation note in `Hero.jsx`,
each section's subtitle passed to `SectionHeader`, and the contact panel's text
in `Contact.jsx`. See [Development](development.md#updating-site-content) for
the per-file guide.

`data/portfolio.js` exports `sections`, the ordered list of section ids and
labels. It is the single source for the dock's links and for the `<section>`
elements `App.jsx` renders, so a section cannot be added to one and forgotten
in the other. Each section is labelled by its heading, whose id is
`${sectionId}-title`.

The section headings are the exception to "one file per section owns its own
markup": all of them render through `components/ui/SectionHeader`, which takes
the heading id, the title and the subtitle, plus a variant and label for the
heavier forms that Projects and Contact use. Sharing one component is what stops
the headings drifting apart as sections are edited independently.

`frontend/test/data.test.js` turns the data layer's conventions into checks:
every About figure must appear in the Experience or Projects entry it cites,
project copy stays within a shared length range, links are absolute `https`,
no export of a data module uses a character the font subset cannot draw, every
command palette entry points somewhere real, and the activity snapshot is a
usable year of days. The data modules stay importable by plain Node for that
reason: relative imports with `.js` extensions, no JSX and no `@/` alias, and
nothing imported into `portfolio.js`, which the snapshot workflow loads without
installing dependencies. The repository invariants check those import rules.

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

The page is **prerendered at build time**. `npm run build` runs three steps,
after npm's `prebuild` gate of lint, content tests and repository invariants
(see [Deployment](deployment.md#the-netlify-build-gate)):

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

Three extras are the exception, because they carry real weight and many visitors
never reach them. Each is a separate chunk, fetched only when wanted:

| Extra | Library | Gzipped | Fetched when |
|-------|---------|---------|--------------|
| Command palette | `cmdk` | 18 KB | The trigger is hovered or focused, or Ctrl/Cmd+K is pressed |
| Contribution graph | `react-activity-calendar` | 25 KB, with its tooltips and data | The block comes within 600px of the viewport |
| Globe | `cobe` | 6 KB | The block comes within 200px of the viewport, on screens of 80rem and up |

The small components that load them add about 2 KB to the first load. Size
Limit budgets in `frontend/.size-limit.json` hold the entry bundle and each of
these chunks to a limit, so a static import that drags a library into the entry
fails CI (see [Testing](testing.md#bundle-size-budgets)). A failed chunk cannot
take the page down: the palette's loader catches it, because the dock sits
outside every `ErrorBoundary`, the graph has a boundary of its own, and the
globe's loader catches the failure and leaves its caption in place.
`cmdk` also bundles Radix Dialog, which the palette does not use, since a native
`<dialog>` gives synchronous focus restoration. It cannot be tree-shaken out, and
is accepted because the chunk only loads on intent.

There is no animation library, no UI kit, no CSS framework and no PWA shell.

---

## Backend

Three layers, so `server.js` stays thin and each concern is testable on its own.

| Module | Responsibility |
|--------|----------------|
| `config/env.js` | Reads and normalizes `process.env` into one frozen `config` object; warns at boot about missing mail settings. Nothing else touches `process.env` |
| `routes/contactRoutes.js` | Rate limiting, field validation, then the honeypot check. Knows nothing about email |
| `services/mailerService.js` | HTML escaping, mail-header sanitization, template rendering, Resend delivery. Knows nothing about HTTP |
| `server.js` | Middleware assembly, health routes, 404, centralized error handler, graceful shutdown |

The service layer signals failure with two typed errors, `MailerNotConfiguredError`
and `EmailDeliveryError`, which the route maps to `503` and `502`. Anything else
is forwarded to the central error handler, which logs the full error and returns
a generic message. The boundary is what keeps provider details out of HTTP
responses. The one exception the handler makes is a body the parser refused:
that is the client's fault, so it answers with the parser's `400`, `413` or `415`
and a fixed message, and logs the error's type only, never the error itself,
which carries the raw request body.

`server.js` exports the Express app and only calls `listen()` when executed
directly, which is what lets the test suite bind an ephemeral port instead of
fighting over 5000.

### Contact form request flow

1. The body is JSON, so the browser first sends an `OPTIONS` preflight. For an
   allowed origin the CORS middleware answers it with `204` and the CORS
   headers; any other origin gets no `Access-Control-Allow-Origin`, and the
   browser stops here.
2. The browser POSTs the form (including the empty `website` honeypot) to
   `/api/contact`.
3. Helmet sets security headers.
4. CORS checks the `Origin` against the allow-list. A disallowed origin gets a
   response with no `Access-Control-Allow-Origin`, which the browser blocks.
5. `express.json({ limit: "16kb" })` parses the body, or rejects it: `413` over
   the cap, `400` for malformed JSON, `415` for an unsupported charset or
   encoding. This runs **before** the router, so those cost no rate-limit
   quota.
6. `express-rate-limit` checks the client IP: 5 requests per 15 minutes, with
   IPv6 clients keyed by `/56` subnet.
7. Validation enforces presence, length caps and the email pattern, returning
   `400` on the first failure.
8. The honeypot check runs on the valid body. A filled `website` field returns
   the same `200` a real send produces, logs the sender, and stops.
9. `mailerService` escapes the values, URL-encodes the address for the
   `mailto:` links, strips control characters from header-bound fields and the
   plain-text part's one-line fields, renders the HTML and plain-text parts, and
   sends via Resend with the submitter's address as `Reply-To`.
10. On success the route logs Resend's message ID and returns the same `200`
    body as step 8. Failures map to `503` (unconfigured) or `502` (rejected, or
    Resend unreachable). Anything unexpected reaches the central handler as a
    `500`.

Status codes and payloads for each step are documented in the
[API reference](api.md#post-apicontact).

---

## Cross-cutting decisions

**One Node version, one source of truth.** `.nvmrc` pins it; CI reads it via
`node-version-file`, `netlify.toml` mirrors it, and all three `package.json`
files declare an `engines.node` range that admits it. The repository invariants
fail if any of those disagree. `.npmrc` sets `engine-strict=true`, so a
mismatched `npm run install:all` fails loudly instead of producing confusing
runtime errors; an install run inside `frontend/` or `backend/` does not read
that file and only warns.

**Couplings that fail silently are tested.** Several values have to agree
across files with nothing at build time to notice when they drift: the CSP hash
of the inline script, the palette copies, the form rules mirrored between
`Contact.jsx` and the route, the backend origin in the CSP. `test/invariants.test.js`
checks each pair, and runs in CI and in Netlify's build.

**The build has no environment-dependent steps.** There is no PostCSS
configuration and no CSS purging, so `npm run build` produces the same output
locally, in CI and on Netlify with no variables set. The one variable is
`VITE_API_BASE_URL`, which a local `frontend/.env` usually sets for work on the
contact form. It does not touch the
network either: the contribution graph reads a committed snapshot, and a weekly
workflow refreshes that as an ordinary commit.

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
