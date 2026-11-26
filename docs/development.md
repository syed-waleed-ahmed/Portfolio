# Development

## Setup

Node 24 (pinned in `.nvmrc`; any of `^22.19 || ^24.5 || >=26` works).

```bash
npm run install:all          # npm ci in frontend/
npm run dev                  # Vite on :5173, client-rendered, all pages
npm run dev:api              # wrangler dev on :8787, the Worker and its limiter
```

Vite proxies `/api` to `:8787`, so with both running the form posts to the
local Worker. Without `dev:api` the form reports that the server could not be
reached; it never posts to production. To send real mail locally, copy
`frontend/.dev.vars.example` to `frontend/.dev.vars` and fill it in; the file
is gitignored. Without it the API answers 503.

The dev server renders in the browser only. To see the prerendered pages, build
and serve them with their production headers:

```bash
npm run build
node frontend/e2e/serve.mjs  # http://127.0.0.1:4174
```

## Commands

From the repository root:

| Command | What it does |
|---|---|
| `npm run lint` | ESLint over the app, the Worker, the scripts and the tests |
| `npm run typecheck` | `tsc --noEmit` with strict settings |
| `npm test` | Content, routing, palette and Worker tests, then the repository invariants |
| `npm run build` | The prebuild gate (lint, types, tests, invariants), then client build, SSR build and prerender into `frontend/dist` |
| `npm run test:e2e` | Playwright and axe against `frontend/dist` (needs a build) |

In `frontend/`: `npm run size` checks the size budgets in `.size-limit.js`
after a build. `npm run build --ignore-scripts` skips the gate, as CI does
because it runs the same checks as separate steps.

## Editing content

| To change | Edit |
|---|---|
| Name, role, links, work authorisation, languages | `src/content/site.ts` |
| A role or a degree | `src/content/experience.ts` |
| A project's summary, pipeline, decision or result | `src/content/projects.ts` |
| A case study's prose, tables or diagrams | `src/case-studies/<slug>.tsx` |
| Skills | `src/content/skills.ts` |
| The hero's copy | `src/components/home/Hero.tsx` |

Rules that keep the content honest:

- **Experience follows the CVs** in `D:\Documents\Employment\Resume\source\`.
  A figure goes on the site only if a CV or the project's own repository or
  report states it.
- **A result carries its caveat** in the same sentence, and a test count never
  headlines a project. The content tests check the second.
- **A skill is "shown"** only if a project or role on the site uses it; the
  rest go under "familiar".
- **Copy uses characters the font subset can draw.** The content tests scan
  every source file; use an icon from `react-icons` for arrows and symbols.
- **Facts repeated outside the repository** (the CVs, LinkedIn, the GitHub
  profile README, each project's README) are not checked by anything here.

Adding a project means an entry in `projects.ts`, a case study in
`src/case-studies/` named by its slug, and optionally screenshots in
`src/assets/projects/` (`<name>-480` and `<name>-960`, each `.avif` and
`.webp`). The route, the sitemap, the structured data and the palette entry
follow from the data. Moving `SITE.updated` in `site.ts` marks the content as
reviewed; the sitemap and the footer read it.

## Tests

| Layer | Where | What it covers |
|---|---|---|
| Content and logic | `frontend/test/content.test.ts` | Project and experience rules, the font subset, routes round-trip, unique titles, structured data per page, the palette's ranking, the form's rules |
| Worker | `frontend/worker/test/` | Every status the API returns, the honeypot answering like a real send, the body cap, origin checks, logs without personal data, the limiter's window and alarm, IPv6 keys, email escaping |
| Invariants | `test/invariants.test.ts` | 7:1 text contrast in both themes, colours only from tokens, a strict CSP with no inline code, each stylesheet loaded once, the Wrangler config, the Node pin, versions, no em dashes |
| Browser | `frontend/e2e/site.spec.ts` | Every page under the real headers: no console errors, no third-party requests, no cookies, axe (WCAG 2.2 AA and best practice) and the 7:1 rule in light and dark, no sideways scroll from 320 to 2560 px, no text under 14 px, the menu without JavaScript, case study contents and diagrams, tables and diagrams reachable by keyboard at phone width, each page loading only its own chunk, the palette as rendered, every state of the form, reduced motion, print, forced colours |

CI runs the browser suite in Chromium, Firefox and WebKit, one job each. To run
one engine locally:

```bash
cd frontend
npx playwright test --project=firefox
E2E_NO_UPGRADE=1 npx playwright test --project=webkit
```

WebKit needs `E2E_NO_UPGRADE=1` because Playwright's WebKit applies the CSP's
`upgrade-insecure-requests` to `http://127.0.0.1` and then loads nothing; the
test server drops that directive when asked. A test that needs a permission
only Chromium can grant, or a forced-colours emulation WebKit lacks, skips
itself there.

What is not tested automatically: real delivery through Resend (the Worker
tests replace the mailer, and the live check reads only whether the secrets
are set), and the truth of the content, which no test can judge.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `npm ci` fails with `EPERM` on Windows | Vite or the test server holds a native binary open. Stop them first. |
| A Git Bash argument `/` became `C:/Program Files/Git/` | Git Bash path conversion. Prefix the command with `MSYS_NO_PATHCONV=1`. |
| The form says the server could not be reached in development | `npm run dev:api` is not running. |
| `npm run build` stops before Vite | The prebuild gate failed; its output names the check. |
| A hydration warning in the console | Something renders differently at build time and in the browser. Move it into an effect. |
