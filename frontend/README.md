# Frontend

The site at [syedwaleedahmed.me](https://syedwaleedahmed.me/): React 19 and
Vite 8, prerendered at build time and hydrated in the browser, styled with
plain CSS in cascade layers. Deployed by Netlify from this directory.

It is one of two independent npm projects in this repository, with its own
`package.json` and lockfile; the other is [`../backend`](../backend/README.md).

```text
frontend/
├── src/
│   ├── components/   layout/ (masthead, dock, footer), sections/ (one per page section), ui/ (primitives)
│   ├── data/         All entries, figures and links, as plain modules with no JSX
│   ├── styles/       Layer order, tokens and global CSS
│   ├── App.jsx       The page
│   ├── main.jsx      Hydrates the prerendered markup
│   └── entry-server.jsx   Build-time render entry
├── public/           Copied verbatim: fonts, images, _headers (CSP and caching), 404.html, sw.js
├── scripts/          prerender.mjs (build step), fetch-github-activity.mjs (graph snapshot)
├── test/             Content tests over src/data
├── e2e/              Playwright + axe suite and the server that applies the real CSP
└── .size-limit.json  Gzip budgets per chunk
```

## Commands

Run inside this directory, or from the repository root with `--prefix frontend`.

| Command | What it does |
|---------|--------------|
| `npm run dev` | Vite on :5173, client render only |
| `npm run build` | Lint, content tests and repository invariants, then the client and SSR builds and the prerender into `dist/` |
| `npm test` | Content tests over `src/data/` |
| `npm run lint` | ESLint |
| `npm run size` | Gzip budgets, after a build |
| `npm run test:e2e` | Browser tests against `dist/`, after a build (`npx playwright install chromium` once) |
| `npm run preview` | Serves `dist/` |

## Read next

- [Architecture](../docs/architecture.md#frontend): layers, prerendering, the data layer
- [Design system](../docs/design.md): tokens, layout and the rules that keep it from drifting
- [Development](../docs/development.md#updating-site-content): editing content
- [Testing](../docs/testing.md): the content tests and the browser suite
