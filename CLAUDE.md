# CLAUDE.md

Guidance for AI coding agents working in this repository. Read the doc for the area you touch:
[architecture](docs/architecture.md), [development](docs/development.md), [deployment](docs/deployment.md),
[design](docs/design.md).

## What this is

The portfolio of Syed Waleed Ahmed, AI software engineer, live at https://syedwaleedahmed.me/. The repository is
public and is read as a work sample, so docs and comments are part of the product.

One npm project in `frontend/`: a React 19 + TypeScript site, prerendered per page at build time, plus a Cloudflare
Worker (`frontend/worker/`) that serves the contact API from the same origin. The root `package.json` only
delegates, and holds `test/invariants.test.ts`. There is no database, no login, no analytics and no client router.

## Commands

From the repository root:

```bash
npm run install:all   # npm ci in frontend/
npm run dev           # Vite on :5173 (client render only)
npm run dev:api       # wrangler dev on :8787; Vite proxies /api to it
npm run lint && npm run typecheck
npm test              # content, routing, palette and Worker tests, then invariants
npm run build         # prebuild gate, then client build, SSR build, prerender
npm run test:e2e      # Playwright + axe against frontend/dist (build first)
```

In `frontend/`: `npm run size` (budgets in `.size-limit.js`), `npx playwright test --project=firefox`, and
`E2E_NO_UPGRADE=1 npx playwright test --project=webkit`. Single test: `node --test --test-name-pattern="palette"
"test/**/*.test.ts"`, or `npx playwright test -g "contact form"`.

Which checks apply: any change needs lint, typecheck and `npm test`; anything rendered needs a build and the browser
suite; a new dependency or a change to what the entry imports needs `npm run size`. CI runs all of them.

## Architecture in brief

- `src/routes.ts` lists every page (`PAGES`); `scripts/prerender.mjs` writes each to `dist/` with its head from
  `src/head.ts`, preload links for the page's chunks from Vite's manifest, and `sitemap.xml`, `_redirects` and
  `.well-known/security.txt`. `main.tsx` matches the URL, loads that page's chunk, and hydrates. Render output must
  be identical at build time and in the browser: read `window`, dates or randomness in effects. In-page links stay
  plain fragment links; `components/layout/InPageLinks.tsx` keeps the fragment out of the address bar.
- Facts live once in `src/content/` (`site.ts`, `projects.ts`, `experience.ts`, `skills.ts`). These, `routes.ts`,
  `head.ts`, `commands.ts` and `src/shared/` use relative `.ts` imports and no JSX, because Node loads them with type
  stripping for the tests, the prerender and the Worker. The invariants test enforces it. Elsewhere use the `@/` alias.
- A case study is `src/case-studies/<slug>.tsx` using `components/case-study/CaseStudy.tsx`; its diagrams are
  `DiagramSpec` data drawn by `Diagram.tsx`. Adding a project means a `projects.ts` entry and that file; the route,
  sitemap, structured data and palette entry follow.
- The contact API (`worker/contact.ts`): parse, validate, rate-limit, honeypot, send, in that order. Its rules come
  from `src/shared/contact.ts`, which the form imports too. The limiter is a Durable Object (`worker/limiter.ts`).
  Logs carry event names only, never what a visitor typed.
- The command palette ranks entries with `rankCommands` in `src/commands.ts` and renders them in that order with
  cmdk's filtering off: cmdk 1.1.1 keys groups by an internal id but looks them up by value, so its own sort never
  moves a group.

## Content rules

- **Experience follows the current CVs** in `D:\Documents\Employment\Resume\source\` (AI, Backend and ML versions);
  they were built from repository evidence. Never invent or round up a figure. A project figure must come from that
  project's own repository or report; RemindrAI's from the thesis and MemorAIz repositories, which are private.
- **Every result carries its caveat** in the same sentence (author-written sets, small samples, lexical metrics, no
  human validation). A test count never headlines a project; the content tests enforce it.
- **Skills are split**: "shown" only if a project or role on the site uses it; otherwise "familiar".
- **RemindrAI confidentiality**: describe the design in prose and redrawn diagrams. Never publish its code, schema,
  live URLs, internal screenshots, environment variable names, or open weaknesses of the live system.
- **Copy uses only characters in the font subset** (`FONT_RANGES` in `test/content.test.ts`); use `react-icons` for
  arrows and symbols. Facts repeated outside the repo (CVs, LinkedIn, the GitHub profile README, project READMEs)
  are not checked by anything here.
- Work authorisation and language levels are shown as the CVs state them; do not infer anything beyond that.

## Design rules

- Colours only through roles in `src/styles/tokens.css`, defined for light and dark. Every text colour holds 7:1 on
  every surface in both themes and control borders 3:1; the invariants test computes this, and no other stylesheet
  may write a colour (print token values excepted).
- No text under 14px. No `style` attributes in components and no inline scripts: the CSP allows neither, and the
  invariants test fails on both.
- All component CSS is `@import`ed by `src/styles/index.css`, so every prerendered page links one stylesheet; the
  command palette's CSS is the only per-chunk stylesheet.
- No CSS framework, animation library or UI kit. Motion is limited to hover and focus transitions and the caret.
- Keep the personal touches: the hand-drawn crewmate favicon and the `hi, Waleed here.` greeting as the page's first
  line.

## Things that fail silently

- **The Worker's secrets** (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`) are set with `wrangler secret put`, not in
  the repo. Missing, the form answers 503 and `verify-deploy.mjs` fails the deploy.
- **The sending domain**: Resend's DKIM, `send`, `rsend` and `_dmarc` records in the Cloudflare zone let the form
  send from `contact@syedwaleedahmed.me`; remove one and mail stops ([deployment](docs/deployment.md)).
- **The Cloudflare zone**: "Always Use HTTPS" and the www-to-apex redirect rule live in the dashboard;
  `verify-deploy.mjs` checks both after each deploy.
- **The domain** is registered at Spaceship until 2027-12-22; nothing watches the date.
- **`public/sw.js`** is a kill switch for a service worker an old version installed. Keep it.
- **`SITE.updated`** in `content/site.ts` is the content's review date, shown in the footer and the sitemap; move it
  when content changes.

## Conventions

- No em dashes anywhere, in code, copy, docs or this file; the invariants test checks every tracked file.
- Comments explain why, not what, and do not narrate history; the changelog and git hold history.
- Conventional Commits under about 72 characters (`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `ci`,
  `content`). Update docs in the same commit as the behaviour, and add a `CHANGELOG.md` entry under `Unreleased` for
  anything visitors would notice.
- Workflows pin actions to a full commit SHA with a `# vX.Y.Z` comment, read Node from `.nvmrc`, and set
  `persist-credentials: false` unless the job pushes. The repository requires SHA pinning.
- Never `npm audit fix --force` in `frontend/`.
- `graphify-out/` is generated and gitignored; leave it out of searches and edits.

## Windows notes

- Stop Vite or the test server before `npm ci`, or it fails with `EPERM` after emptying `node_modules`.
- In Git Bash, prefix commands that pass `/`-paths as arguments with `MSYS_NO_PATHCONV=1`.
- Shell heredocs and `node -e` strings mangle backslashes; write files with an editor tool instead.
