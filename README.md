# Syed Waleed Ahmed -- Portfolio

A modern, responsive **personal portfolio website** built with **React 19 + Vite** on the frontend and **Node.js + Express** on the backend.
Designed with a focus on **performance**, **accessibility**, **security**, and **clean UI/UX**.

**Live:** https://syedwaleedahmed.me/

---

## Highlights

- **Lean bundle** -- no animation library, no PWA shell, no Bootstrap JS. ~9 KB CSS gzipped, ~70 KB JS gzipped after code-splitting
- **Fast build & delivery** -- Vite, code-splitting, lazy-mounted sections (`content-visibility: auto`)
- **Modern UI** -- glassmorphism cards, gradient accents, monospace HUD-style section labels, top-of-page scroll progress bar
- **Hand-rolled animations** -- vanilla `IntersectionObserver` reveal hook + CSS keyframes (no `framer-motion`, no `tsparticles`)
- **Custom navbar** -- own collapse logic, no Bootstrap JS dependency
- **Accessibility** -- skip-to-content link, focus-visible rings, semantic landmarks, `prefers-reduced-motion` honored
- **Custom 404 page** -- branded standalone page Netlify auto-serves on missing routes
- **Fully responsive** -- desktop, tablet, mobile (375px+ baseline)
- **Hardened backend** -- Helmet security headers, `express-rate-limit`, body-size cap, trust-proxy, graceful shutdown
- **CI/CD** -- GitHub Actions runs lint, build, syntax check, `npm audit`, and gitleaks secret scan on every push and PR
- **Auto dependency updates** -- Dependabot opens grouped weekly PRs for minor + patch upgrades (majors are manual)
- **Pinned Node version** -- `.nvmrc`, `netlify.toml`, and `engines` field keep Netlify, CI, and local installs aligned
- **SEO-ready** -- canonical URL, expanded `Person` + `WebSite` JSON-LD schemas, OG + Twitter cards, sitemap, robots.txt, humans.txt
- **Content Security Policy** -- Netlify `_headers` with strict CSP and friends
- **Print-friendly** -- dedicated print stylesheet
- **Custom domain + HTTPS** -- syedwaleedahmed.me
- **Data-driven architecture** -- portfolio content lives in `src/data/`, components are pure UI
- **Error boundary** -- graceful crash recovery for below-fold sections

---

## Sections

| Section | Description |
|---------|-------------|
| Hero | Animated intro, role badge, rotating "currently exploring" pill, primary CTAs + LinkedIn / GitHub icon links |
| About | Background summary + education timeline |
| Experience | Work history cards (MemorAIz thesis, Fruugle internship, Jubilee trainee) |
| Projects | Featured AI/ML and academic projects with tech tags + GitHub links |
| Skills | Bento-style tag groups across AI/LLM, ML, Languages, Web, Databases, Tools |
| Interests | What I'm looking for next + topics I'm exploring |
| Contact | Contact form (name, email, subject, message) with email delivery via Resend |

---

## Tech Stack

### Frontend
- React 19, Vite 7, Bootstrap 5 (CSS only -- no Bootstrap JS)
- `react-icons` for the icon set
- Vanilla `IntersectionObserver` for scroll-reveal -- no animation library
- CSS keyframes for hero entrance and "explore" pill cycle
- AVIF / WebP profile image with `<picture>` + `fetchpriority="high"`
- PurgeCSS in production trims unused Bootstrap utilities to ~9 KB gzipped

### Backend
- Node.js 20, Express 4 (ESM)
- Resend for transactional email
- **Security**: Helmet (CSP / X-Frame-Options / no-sniff / etc.), `express-rate-limit` (5 req / 15 min / IP), 16 KB JSON body cap, trust-proxy=1, silent CORS reject (no leaky 500s), centralized error handler, graceful SIGTERM shutdown

### Deployment
- Frontend: **Netlify** (syedwaleedahmed.me) -- `netlify.toml` pins `NODE_VERSION=20`
- Backend: **Render**

### CI / CD
- **GitHub Actions** (`.github/workflows/ci.yml`):
  - Frontend job: `npm ci` -> `eslint` -> `vite build`
  - Backend job: `npm ci` -> `node --check server.js` -> `npm audit --omit=dev --audit-level=high`
  - Secret-scan job: `gitleaks` over full git history
  - Concurrency-cancelled to avoid stale runs
- **Dependabot** (`.github/dependabot.yml`): grouped weekly minor+patch PRs for `frontend/` and `backend/`, monthly GitHub Actions updates. Major-version bumps are ignored (manual review only).

---

## Project Structure

```
portfolio/
+-- .github/
|   +-- workflows/
|   |   +-- ci.yml                        # Lint + build + audit + gitleaks
|   +-- dependabot.yml                    # Auto-PRs for npm + actions
|   +-- PULL_REQUEST_TEMPLATE.md          # PR checklist
+-- frontend/
|   +-- public/
|   |   +-- images/
|   |   |   +-- Profile.avif
|   |   |   +-- Profile.webp
|   |   +-- _headers                      # Netlify security headers (CSP, X-Frame-Options, ...)
|   |   +-- 404.html                      # Branded 404 page Netlify auto-serves
|   |   +-- humans.txt                    # Authorship + tech-stack signal
|   |   +-- apple-touch-icon.png
|   |   +-- favicon.ico
|   |   +-- favicon-96x96.png
|   |   +-- favicon.svg
|   |   +-- googleb4ba9f6faa31c433.html   # Google Search Console verification
|   |   +-- web-app-manifest-192x192.png
|   |   +-- web-app-manifest-512x512.png
|   |   +-- sitemap.xml
|   |   +-- robots.txt
|   +-- src/
|   |   +-- data/                         # Portfolio content -- edit here to update site
|   |   |   +-- portfolio.js
|   |   |   +-- experience.js
|   |   |   +-- projects.js
|   |   |   +-- skills.js
|   |   +-- styles/                       # Modular CSS
|   |   |   +-- base.css
|   |   |   +-- navbar.css
|   |   |   +-- hero.css
|   |   |   +-- components.css
|   |   +-- components/
|   |   |   +-- layout/                   # App chrome (header / footer)
|   |   |   |   +-- Navbar.jsx
|   |   |   |   +-- Footer.jsx
|   |   |   +-- sections/                 # One file per page section
|   |   |   |   +-- Hero.jsx
|   |   |   |   +-- About.jsx
|   |   |   |   +-- Experience.jsx
|   |   |   |   +-- Projects.jsx
|   |   |   |   +-- Skills.jsx
|   |   |   |   +-- Interests.jsx
|   |   |   |   +-- Contact.jsx
|   |   |   +-- ui/                       # Reusable primitives, no domain coupling
|   |   |       +-- ErrorBoundary.jsx
|   |   |       +-- LazyMountSection.jsx
|   |   |       +-- Reveal.jsx
|   |   |       +-- ScrollProgress.jsx
|   |   |       +-- ScrollToTop.jsx
|   |   |       +-- SkipLink.jsx
|   |   +-- hooks/                        # Shared React hooks
|   |   |   +-- useInView.js              # IntersectionObserver wrapper
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- index.css
|   +-- index.html
|   +-- vite.config.js
|   +-- postcss.config.js
|   +-- eslint.config.js
|   +-- package.json
|   +-- .env.example                      # Template for VITE_API_BASE_URL
+-- backend/
|   +-- server.js                         # Helmet, CORS, body cap, error handler, graceful shutdown
|   +-- routes/
|   |   +-- contactRoutes.js              # Validation + rate limit + Resend
|   +-- package.json
|   +-- .env.example                      # Template for RESEND_API_KEY, EMAIL_TO, EMAIL_FROM
+-- .editorconfig                         # Cross-platform editor settings
+-- .gitattributes                        # Normalized line endings, binary detection
+-- .gitignore
+-- .npmrc                                # Strict engine enforcement
+-- .nvmrc                                # Node 20
+-- LICENSE                               # MIT
+-- netlify.toml                          # Pins NODE_VERSION on Netlify
+-- README.md
+-- SECURITY.md                           # Vulnerability reporting policy
```

---

## Caching & Cache-Busting

Cache rules live in `frontend/public/_headers` (Netlify edge headers):

| Path | Cache | Why |
|------|-------|-----|
| `/`, `/index.html`, `/404.html` | `max-age=0, must-revalidate` | A deploy is visible on the next browser visit -- never serve stale HTML |
| `/sw.js` | `max-age=0, must-revalidate` | Kill-switch SW (see below) needs to reach users without a 24 h delay |
| `/assets/*` | `max-age=31536000, immutable` | Filenames are content-hashed by Vite -- 1-year cache is correct |
| `/images/*` | `max-age=86400` | 1-day cache -- swap a portrait and it propagates within a day |

### Stale service worker recovery

The site briefly shipped with `vite-plugin-pwa`. Visitors from that
window still have a service worker installed locally that intercepts
every request and serves cached files. To recover:

- `frontend/public/sw.js` is a **kill-switch SW** -- on next update, it
  deletes every cache the old SW created, unregisters itself, and
  reloads open tabs.
- An inline script in `index.html` defensively unregisters any leftover
  SW and clears `caches` storage on every page load. Idempotent.

Both run together so users can't get stuck on a stale build. Once
analytics show no SW traffic for ~30 days, `sw.js` can be deleted.

---

## Architecture

The frontend follows a **layered component structure** so new code has an
obvious home as the project grows:

| Layer | What lives here | Examples |
|-------|-----------------|----------|
| `components/layout/` | App chrome that frames every page | `Navbar`, `Footer` |
| `components/sections/` | One file per visible page section | `Hero`, `About`, `Projects`, `Contact` |
| `components/ui/` | Reusable primitives with no domain coupling | `Reveal`, `ScrollProgress`, `ScrollToTop`, `SkipLink`, `ErrorBoundary`, `LazyMountSection` |
| `hooks/` | Cross-cutting React hooks | `useInView` (used by `Reveal` + `LazyMountSection`) |
| `data/` | Pure content (no JSX), edited to update site copy | `experience.js`, `projects.js`, ... |
| `styles/` | Global CSS — tokens, layout, components | `base.css`, `navbar.css`, `hero.css`, `components.css` |

Imports use the **`@/` alias** that maps to `frontend/src/` (configured in
`vite.config.js`), so paths stay flat regardless of folder depth:

```js
// good — same wherever this lives
import Reveal from "@/components/ui/Reveal";
import { projects } from "@/data/projects";

// bad — fragile if the file moves
import Reveal from "../../ui/Reveal";
```

---

## Local Setup

Requires **Node.js 20+** (use [nvm](https://github.com/nvm-sh/nvm): `nvm use`).

### 1. Clone

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # optional override of VITE_API_BASE_URL
npm install
npm run dev
```

Runs at `http://localhost:5173`

### 3. Backend

```bash
cd backend
cp .env.example .env       # required -- fill in real values
npm install
npm start
```

Runs at `http://localhost:5000`

---

## Environment Variables

### `backend/.env`

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | no (Render sets this) | Listen port |
| `NODE_ENV` | recommended | `production` suppresses error-detail leaks |
| `RESEND_API_KEY` | yes | API key from https://resend.com |
| `EMAIL_FROM` | yes | Verified sender (or `onboarding@resend.dev` for testing) |
| `EMAIL_TO` | yes | Where contact-form messages land |

### `frontend/.env` (optional)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Override the default backend URL during local dev |

---

## Adding Content

All portfolio content is centralized in `frontend/src/data/`:

- **New experience?** Add an entry to `experience.js`
- **New project?** Add an entry to `projects.js`
- **New skill group / tag?** Add an entry to `skills.js`
- **Update contact / social links?** Edit `portfolio.js`

Components are pure UI -- they read from the data layer and render automatically.

---

## Contact Form Flow

1. User submits the form (name / email / subject / message)
2. Frontend POSTs to `/api/contact` on the backend
3. `express-rate-limit` checks the requester's IP (5 / 15 min)
4. Backend validates input (required, length caps, email regex)
5. HTML-escaped email is sent via Resend with the user's address as `replyTo`
6. Errors flow through a centralized handler -- nothing leaks stack traces

---

## Security

- **Content Security Policy** -- HTTP header via Netlify `_headers`
- **Backend security headers** -- `helmet()` middleware (CSP-ready, X-Frame-Options DENY, no-sniff, Referrer-Policy)
- **HTML escaping** -- all user input is escaped before rendering in email templates
- **Rate limiting** -- `express-rate-limit` (5 requests / 15 min window, standard `RateLimit-*` headers)
- **Input validation** -- max lengths enforced (name: 100, email: 100, subject: 200, message: 5000)
- **Body-size cap** -- `express.json({ limit: "16kb" })` to prevent payload abuse
- **Trust-proxy=1** -- IP is read from the platform proxy hop only (Render); not blindly from client headers
- **CORS** -- silent reject on disallowed origins (no leaky 500s)
- **Graceful shutdown** -- SIGTERM/SIGINT close the server cleanly so platform restarts don't drop in-flight requests
- **Secret scanning** -- gitleaks runs in CI on every push and PR
- **Audit gate** -- CI fails on production-dependency vulnerabilities at `high` or above
- **DNS prefetch** -- preconnect hint for backend API to reduce first-contact latency
- **Reporting** -- see [SECURITY.md](SECURITY.md) for responsible disclosure

---

## License

MIT -- see [LICENSE](LICENSE)
