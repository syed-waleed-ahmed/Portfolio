# Frontend and Worker

The site at [syedwaleedahmed.me](https://syedwaleedahmed.me/) and its contact API, one npm project and one
Cloudflare Worker. See the [root README](../README.md) and [docs/](../docs/) for how it fits together.

```text
frontend/
├── src/
│   ├── content/        Facts as typed data: person, projects, experience, skills
│   ├── case-studies/   One page per project, prose and diagrams
│   ├── components/     home/, case-study/, layout/, ui/, widgets/ (the command palette)
│   ├── pages/          Home, privacy, 404
│   ├── shared/         The contact form's rules, imported by the page and the Worker
│   ├── styles/         Tokens and global CSS; one stylesheet for every page
│   ├── routes.ts       Every page, its URL and metadata
│   ├── head.ts         Each page's <head> and structured data
│   ├── main.tsx        Loads the page's own chunk, then hydrates the prerendered page
│   └── entry-server.tsx  Renders every page at build time
├── worker/             The contact API and its rate limiter, with tests
├── public/             Copied as is: font, images, favicons, _headers, robots.txt, sw.js
├── scripts/            prerender.mjs (pages, preloads, sitemap, redirects, security.txt), verify-deploy.mjs
├── test/               Content and logic tests
├── e2e/                Playwright and axe suite, and the server that applies the real headers
├── wrangler.jsonc      The Worker, its assets, its Durable Object and its domains
└── .size-limit.js      Size budgets, read from the built pages
```

Commands are listed in [docs/development.md](../docs/development.md).
