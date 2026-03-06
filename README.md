# Syed Waleed Ahmed -- Portfolio

A modern, responsive **personal portfolio website** built with **React 19 + Vite** on the frontend and **Node.js + Express** on the backend.
Designed with a focus on **performance**, **accessibility**, **security**, and **clean UI/UX**.

**Live:** https://www.syedwaleedahmed.me/

---

## Highlights

- Fast build & delivery -- Vite, code-splitting, lazy-mounted sections (`content-visibility: auto`)
- Modern UI -- glassmorphism, neo-card design, Bootstrap 5 grid
- Smooth animations -- CSS keyframe hero entrance + Framer Motion scroll reveals + animated skill progress bars (reduced-motion friendly)
- Fully responsive -- desktop, tablet, mobile
- Secure contact form -- server-side HTML escaping, input length validation, IP-based rate limiting
- SEO-ready -- canonical URL, structured data, sitemap, robots.txt, Google Search Console
- PWA-ready -- manifest, icons, service worker via vite-plugin-pwa
- Google Analytics -- visitor tracking via gtag (G-E5YE59PWT0)
- Content Security Policy -- meta tag + Netlify `_headers` with security hardening
- Print-friendly -- dedicated print stylesheet for clean paper output
- Custom domain + HTTPS
- Data-driven architecture -- all portfolio content lives in `src/data/`, components are pure UI
- Error boundary -- graceful crash recovery for below-fold sections

---

## Sections

| Section | Description |
|---------|-------------|
| Hero | Animated intro with rotating "currently exploring" pill |
| About | Background summary with profile image (AVIF) |
| Experience | Work history cards (Thesis, Internship, Trainee) |
| Projects | Featured projects with tech tags and GitHub links |
| Skills | Animated progress bars across AI/ML, Data & Backend, Web & Tools |
| Interests | Two-column layout -- paragraph + topic list |
| Contact | Working contact form with email delivery |

---

## Tech Stack

### Frontend
- React 19, Vite 7, Bootstrap 5
- Framer Motion (scroll reveals only, loaded with lazy components)
- CSS keyframe animations for hero entrance (no JS runtime cost)
- react-icons, react-tsparticles (loaded on first scroll)
- vite-plugin-pwa, AVIF/WebP images
- PurgeCSS for production CSS trimming

### Backend
- Node.js, Express (ESM)
- Resend (email delivery)
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
|   |   +-- images/Profile.avif
|   |   +-- _headers              # Netlify security headers (CSP, X-Frame-Options)
|   |   +-- ai-grid.webp          # Hero background images
|   |   +-- code-snippet.webp
|   |   +-- llm-chip.webp
|   |   +-- apple-touch-icon.png
|   |   +-- favicon.ico
|   |   +-- favicon-96x96.png
|   |   +-- favicon.svg
|   |   +-- googleb4ba9f6faa31c433.html  # Google Search Console verification
|   |   +-- web-app-manifest-192x192.png
|   |   +-- web-app-manifest-512x512.png
|   |   +-- site.webmanifest
|   |   +-- sitemap.xml
|   |   +-- robots.txt
|   +-- src/
|   |   +-- data/                 # Portfolio content (edit here to update site)
|   |   |   +-- portfolio.js      # Personal info, social links, nav, explore items
|   |   |   +-- experience.js     # Work history entries
|   |   |   +-- projects.js       # Project entries
|   |   |   +-- skills.js         # Skill groups & percentages
|   |   +-- styles/               # Modular CSS (split from single App.css)
|   |   |   +-- base.css          # Variables, resets, backgrounds, sections
|   |   |   +-- navbar.css        # Glass nav, hamburger, pill links
|   |   |   +-- hero.css          # Hero section, animations, orbs, pills
|   |   |   +-- components.css    # Cards, timeline, skills, contact, footer
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
|   |   |   +-- ParticlesBackground.jsx
|   |   |   +-- Reveal.jsx
|   |   |   +-- LazyMountSection.jsx
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
|   +-- .env
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
- **New skill group?** Add an entry to `skills.js`
- **Update contact/social links?** Edit `portfolio.js`

Components are pure UI -- they read from the data layer and render automatically.

---

## Contact Form Flow

1. User submits form on the frontend
2. Frontend POSTs to the backend API
3. Backend validates input (length limits, required fields)
4. Rate limiter checks IP (5 requests per 15 minutes)
5. HTML-escaped email is sent via Resend

---

## Security

- **Content Security Policy** -- meta tag + HTTP header via Netlify `_headers`
- **HTML escaping** -- All user input is escaped before rendering in email templates
- **Rate limiting** -- In-memory IP-based limiter (5 requests / 15 min window)
- **Input validation** -- Max lengths enforced (name: 100, email: 100, phone: 25, subject: 200, message: 5000)
- **CORS** -- Configured for allowed origins only
- **Security headers** -- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **DNS prefetch** -- Preconnect hint for backend API to reduce first-contact latency

---

## License

MIT -- see [LICENSE](LICENSE)