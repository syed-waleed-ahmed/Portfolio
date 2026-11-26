# Architecture

The site is a set of prerendered pages served as static files by Cloudflare,
plus one small Worker that receives the contact form. There is no database,
no login and no analytics.

```text
Browser ──> Cloudflare (static assets from frontend/dist, with _headers)
   │
   └── POST /api/contact ──> Worker (frontend/worker) ──> Resend ──> inbox
                               └── ContactLimiter (Durable Object, one per client)
```

## Repository layout

```text
frontend/
  src/
    content/       Facts as typed data: person, projects, experience, skills
    case-studies/  One TSX file per project, the long-form page
    components/    home/, case-study/, layout/, ui/, widgets/
    pages/         Home, privacy, 404
    shared/        Code the page and the Worker both import (the form's rules)
    styles/        Tokens, base, layout, components, print; one stylesheet
    routes.ts      Every page, its URL and its metadata
    head.ts        Each page's <head> and structured data
    commands.ts    The command palette's entries and ranking
  worker/          The contact API and its rate limiter, with tests
  scripts/         prerender.mjs, verify-deploy.mjs
  test/            Content and logic tests (Node's runner)
  e2e/             Browser tests (Playwright and axe) and the test server
test/              Repository invariants
scripts/           The social card generator and the release-notes formatter
docs/              This file, development, deployment, design
```

## Rendering

`npm run build` runs three steps:

1. `vite build` compiles the client bundle.
2. `vite build --ssr src/entry-server.tsx` compiles a Node bundle that renders
   every entry in `PAGES` (from `routes.ts`) to HTML, with its `<head>`.
3. `scripts/prerender.mjs` writes each page into `dist/` (`/` to
   `index.html`, `/work/remindrai/` to `work/remindrai/index.html`, the 404
   page to `404.html`) and generates `sitemap.xml` from the same list. From
   Vite's manifest it adds a `modulepreload` link for each chunk the page will
   load beyond the entry's, then deletes the manifest. It also writes
   `_redirects`, a permanent redirect for each page asked for without its
   trailing slash; the host's own is a 307.

In the browser, `main.tsx` matches the URL to a route, loads that page's body,
which is a chunk of its own (the home page, each case study, privacy, 404), and
hydrates. A page never downloads another page's code, and because the chunk is
preloaded the wait costs no extra round trip. Navigation between pages is
ordinary links: there is no client-side router, because every page is already
a file.

Everything is readable without JavaScript. Scripts add the command palette,
the form's inline validation and status messages, and closing the phone menu
after a choice; the form itself posts natively before hydration, and the
Worker answers such a post with a plain page.

Render output must be identical at build time and in the browser. The one
platform-dependent value, the Command key on Apple devices, is read with
`useSyncExternalStore` after hydration; the build year is fixed by Vite's
`define`.

## Content

Facts live once, in `src/content/`:

- `site.ts`: the person, links, work authorisation, languages and the
  sections of the home page.
- `projects.ts`: each project's summary, pipeline, the decision worth asking
  about, and its measured result with the caveat attached.
- `experience.ts`: roles in the words of the current CVs, and education.
- `skills.ts`: skills the work shows, and skills only familiar from
  coursework or a traineeship.

These modules use relative `.ts` imports so Node can load them with type
stripping: the content tests, the prerender and the structured data all read
the same objects. A case study's prose is in its TSX file, which also holds
its diagrams as data (`components/case-study/Diagram.tsx` draws them).

## The contact API

`POST /api/contact`, same origin, handled by `worker/contact.ts`.

| | |
|---|---|
| Body | JSON `{ name, email, subject, message, website }`, or the same fields form-encoded when the page posts before its script loads. 16 KB at most. |
| Rules | From `src/shared/contact.ts`, which the form imports too: every field required and trimmed; name and email up to 100 characters, subject 200, message 5,000; an address with control characters or unpaired surrogates is refused. |
| Rate limit | 5 per client per 15 minutes. The client is the `CF-Connecting-IP` address, or its /56 for IPv6. |
| Honeypot | A filled `website` field gets the same 200 a real send gets, and nothing is sent. |

| Status | When |
|---|---|
| 200 `{ "ok": true }` | Sent, or caught by the honeypot |
| 400 `{ ok: false, error, field? }` | Invalid input or malformed JSON |
| 403 | An `Origin` header from another site |
| 405, 415, 413 | Wrong method, content type, or size |
| 429 | Over the limit, with `Retry-After` |
| 502 | Resend refused, could not be reached, or did not answer in 10 seconds |
| 503 | The mail secrets are not set, or the rate limiter could not answer |
| 500 | Anything else; no detail is returned |

`GET /api/health` answers `{ status: "ok", mailer: "configured" | "missing" }`
and is what the deploy verification reads. Any other path under `/api/`
answers 404, with the same API headers.

The order is parse, validate, limit, honeypot, send: a body that cannot be
parsed or does not validate costs no quota, so a visitor fixing a typo is never
locked out. If the limiter cannot answer, the API answers 503 and sends
nothing. The limiter is a Durable Object per client holding only
the times of recent submissions, deleted by an alarm when the window passes.
Logs record events (`contact.sent`, `contact.rate_limited`), never what a
visitor typed.

## Security and privacy

- **Content Security Policy:** `default-src 'self'` with no inline script or
  style anywhere, `connect-src 'self'`, `frame-ancestors 'none'`. The
  invariants test fails on an inline script in `index.html`, a `style`
  attribute in a component, or a widened `script-src`.
- **Other headers** (`public/_headers`): HSTS, `nosniff`,
  `X-Frame-Options: DENY`, a strict referrer policy, `Cross-Origin-Opener-Policy`,
  and a permissions policy that denies camera, microphone and location. The
  Worker sets its own on API responses: `no-store`, `nosniff` and
  `default-src 'none'`.
- **No tracking:** no analytics, no cookies, no third-party requests. The
  browser suite fails if a page sets a cookie or calls another host.
- **The form:** same-origin only, validated on both sides from one module,
  escaped for HTML and URL-encoded where an address becomes a `mailto:` link,
  with header fields flattened so a value cannot add a header.
- **Secrets:** the Resend key and the mail addresses are Worker secrets, set
  with Wrangler; none is in the repository. CI runs gitleaks over the full
  history and `npm audit` on production dependencies.
- **Reporting:** `SECURITY.md`, and `/.well-known/security.txt` (RFC 9116),
  which the prerender writes so its required expiry date moves forward with
  every deploy.

The privacy page (`src/pages/PrivacyPage.tsx`) states the processing in plain
words. It makes no claim of legal compliance.

## Decisions

| Decision | Instead of | Why, and the cost |
|---|---|---|
| Keep React, Vite and a hand-written prerender | Moving to Astro or Next.js | The prerender is a short script and already gives static HTML per page; a framework migration would rewrite working code for little gain. The cost is that every page hydrates React: with its own chunk, a page loads 79 to 90 kB of gzipped script. |
| Strict TypeScript, version 6 | TypeScript 7 | typescript-eslint supports TypeScript below 6.1. Types replace several content tests, such as a project having exactly one kind of source. |
| The contact API in the site's Worker | Express on Render's free tier | Render slept after 15 minutes, so the first message waited up to a minute; it also needed CORS, a guessed proxy count for rate limiting and dashboard-only settings. The Worker has none of those. The cost is a one-time secret setup and a Durable Object for exact limits. |
| Each page's body as its own chunk, preloaded | One bundle with every page in it | A case study or the privacy page no longer downloads the home page's components. The cost is more, smaller files, and a build step that reads Vite's manifest to write the preload links. |
| A Durable Object for the rate limit | Cloudflare's rate-limiting binding | The binding counts per data centre over 10 or 60 seconds only. |
| No analytics | Google Analytics behind a consent banner | It was the heaviest script on the page (179 kB) and the only reason for cookies. Cloudflare's own request statistics remain. |
| Keep the command palette, rank results in code | Removing it, or cmdk's built-in filter | It is the fastest way across six case studies. cmdk 1.1.1 cannot reorder its groups, so it only moves the selection. |
| Text navigation in a sticky header | The floating icon dock | Labels say where they lead, and nothing covers the content. |
| Diagrams as data, drawn as SVG | Exported images | Themable, sharp at any size, real text for screen readers, and each a few lines to change. |
| Remove the globe, the contribution graph and the reveal animation | Keeping them | Decorative, template-derived, and two of them were extra dependencies and a weekly bot commit. |
