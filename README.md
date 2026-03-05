# Syed Waleed Ahmed -- Portfolio

A modern, responsive **personal portfolio website** built with **React 19 + Vite** on the frontend and **Node.js + Express** on the backend.
Designed with a focus on **performance**, **accessibility**, **security**, and **clean UI/UX**.

**Live:** https://www.syedwaleedahmed.me/

---

## Highlights

- Fast build & delivery -- Vite, code-splitting, lazy-mounted sections (`content-visibility: auto`)
- Modern UI -- glassmorphism, neo-card design, Bootstrap 5 grid
- Smooth animations -- Framer Motion reveal + animated skill progress bars (reduced-motion friendly)
- Fully responsive -- desktop, tablet, mobile
- Secure contact form -- server-side HTML escaping, input length validation, IP-based rate limiting
- SEO-ready -- canonical URL, structured data, sitemap, robots.txt
- PWA-ready -- manifest, icons, service worker via vite-plugin-pwa
- Custom domain + HTTPS

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
- React 19, Vite, Framer Motion
- Bootstrap 5, Custom CSS (glassmorphism)
- react-icons, react-tsparticles
- vite-plugin-pwa, AVIF/WebP images

### Backend
- Node.js, Express (ESM)
- Resend (email delivery)
- CORS, dotenv
- In-memory rate limiter, HTML escaping, Input validation

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
|   |   +-- favicon.ico
|   |   +-- favicon.svg
|   |   +-- apple-touch-icon.png
|   |   +-- favicon-96x96.png
|   |   +-- web-app-manifest-192x192.png
|   |   +-- web-app-manifest-512x512.png
|   |   +-- ai-grid.webp
|   |   +-- code-snippet.webp
|   |   +-- llm-chip.webp
|   |   +-- site.webmanifest
|   |   +-- sitemap.xml
|   |   +-- robots.txt
|   +-- src/
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
|   |   +-- App.jsx
|   |   +-- App.css
|   |   +-- main.jsx
|   |   +-- index.css
|   +-- index.html
|   +-- vite.config.js
|   +-- package.json
+-- backend/
|   +-- server.js
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

---

## Contact Form Flow

1. User submits form on the frontend
2. Frontend POSTs to the backend API
3. Backend validates input (length limits, required fields)
4. Rate limiter checks IP (5 requests per 15 minutes)
5. HTML-escaped email is sent via Resend

---

## Security

- **HTML escaping** -- All user input is escaped before rendering in email templates
- **Rate limiting** -- In-memory IP-based limiter (5 requests / 15 min window)
- **Input validation** -- Max lengths enforced (name: 100, email: 100, phone: 25, subject: 200, message: 5000)
- **CORS** -- Configured for allowed origins

---

## License

MIT -- see [LICENSE](LICENSE)