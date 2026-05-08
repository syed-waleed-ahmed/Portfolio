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
- **Fully responsive** -- desktop, tablet, mobile
- **Secure contact form** -- server-side HTML escaping, length validation, IP-based rate limiting
- **SEO-ready** -- canonical URL, Person structured data, sitemap, robots.txt
- **Google Analytics** -- visitor tracking via gtag (deferred to idle to avoid blocking the main thread)
- **Content Security Policy** -- Netlify `_headers` with security hardening
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
- Node.js, Express (ESM)
- Resend for transactional email
- CORS, dotenv
- In-memory rate limiter, HTML escaping, input validation

### Deployment
- Frontend: **Netlify** (syedwaleedahmed.me)
- Backend: **Render**

---

## Project Structure

```
portfolio/
+-- frontend/
|   +-- public/
|   |   +-- images/
|   |   |   +-- Profile.avif
|   |   |   +-- Profile.webp
|   |   +-- _headers                      # Netlify security headers (CSP, X-Frame-Options, ...)
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
|   |   |   +-- portfolio.js              # Personal info, social links, nav, explore items
|   |   |   +-- experience.js             # Work history entries
|   |   |   +-- projects.js               # Project entries
|   |   |   +-- skills.js                 # Skill groups (tag-based)
|   |   +-- styles/                       # Modular CSS
|   |   |   +-- base.css                  # Tokens, resets, sections, scroll-to-top
|   |   |   +-- navbar.css                # Custom navbar + scroll progress bar
|   |   |   +-- hero.css                  # Hero section, animations, orbs, CTAs
|   |   |   +-- components.css            # Cards, timeline, skills, contact, footer
|   |   +-- components/
|   |   |   +-- Hero.jsx
|   |   |   +-- About.jsx
|   |   |   +-- Experience.jsx
|   |   |   +-- Projects.jsx
|   |   |   +-- Skills.jsx
|   |   |   +-- Interests.jsx
|   |   |   +-- Contact.jsx
|   |   |   +-- Navbar.jsx
|   |   |   +-- Footer.jsx
|   |   |   +-- ScrollProgress.jsx        # Top-of-page progress bar
|   |   |   +-- ScrollToTop.jsx           # Floating back-to-top button
|   |   |   +-- Reveal.jsx                # Scroll-reveal IntersectionObserver wrapper
|   |   |   +-- LazyMountSection.jsx      # Mounts a section only when near viewport
|   |   |   +-- ErrorBoundary.jsx
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- index.css
|   +-- index.html
|   +-- vite.config.js
|   +-- postcss.config.js
|   +-- eslint.config.js
|   +-- package.json
+-- backend/
|   +-- server.js
|   +-- routes/
|   |   +-- contactRoutes.js
|   +-- package.json
|   +-- .env                              # Not committed
+-- .gitignore
+-- LICENSE
+-- README.md
```

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

### 3. Backend

```bash
cd backend
npm install
npm start
```

Runs at `http://localhost:5000`

---

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
EMAIL_FROM=portfolio@yourdomain.com
EMAIL_TO=your-email@gmail.com
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Optionally create `frontend/.env` to override the backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

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

1. User submits form on the frontend (name / email / subject / message)
2. Frontend POSTs to `/api/contact` on the backend
3. Backend validates input (length limits, required fields)
4. Rate limiter checks IP (5 requests per 15 minutes)
5. HTML-escaped email is sent via Resend with the user's address as `replyTo`

---

## Security

- **Content Security Policy** -- HTTP header via Netlify `_headers`
- **HTML escaping** -- all user input is escaped before rendering in email templates
- **Rate limiting** -- in-memory IP-based limiter (5 requests / 15 min window)
- **Input validation** -- max lengths enforced (name: 100, email: 100, subject: 200, message: 5000)
- **CORS** -- configured for allowed origins only
- **Security headers** -- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **DNS prefetch** -- preconnect hint for backend API to reduce first-contact latency

---

## License

MIT -- see [LICENSE](LICENSE)
