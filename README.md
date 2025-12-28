# 🌐 Syed Waleed Ahmed — Portfolio

A modern, responsive **personal portfolio website** built with **React + Vite** on the frontend and **Node.js + Express** on the backend.  
Designed with a focus on **performance (Core Web Vitals)**, **accessibility**, **clean UI/UX**, and a **production-ready contact system**.

🔗 **Live Website:**  
👉 https://www.syedwaleedahmed.me/

---

## ✨ Highlights

- ⚡ Fast build + optimized delivery (Vite, code-splitting, lazy-loaded sections)
- 🎨 Modern UI (glassmorphism + gradients)
- 🎥 Smooth animations (Framer Motion, reduced-motion friendly)
- 📱 Fully responsive (desktop/tablet/mobile)
- 📨 Working contact form (backend email delivery via Resend/SMTP)
- 🔍 SEO-ready (canonical URL, structured data, sitemap/robots support)
- 🌐 Custom domain + HTTPS

---

## 🧩 Features

### 🎨 Frontend

- **React + Vite**
- Hero section with animated text + optimized LCP image (AVIF/WebP)
- Scroll-based reveal animations
- “Currently exploring” rotating pill
- Skills with animated progress bars
- PWA-ready (manifest, icons)
- Accessibility-first (ARIA labels, semantic headings)
- Lighthouse-focused improvements:
  - Reduced main-thread work (lazy mount + throttled animations)
  - Deferred heavy visuals (Particles loaded after idle / disabled on mobile/low-end)
  - Responsive image delivery (`srcset/sizes` recommended)

**Sections included:**
- Home / Hero
- About
- Experience
- Projects
- Skills
- Interests
- Contact

---

### 📨 Backend

- **Node.js + Express**
- Contact form email delivery
- Provider support: **Resend** or SMTP
- Input validation
- CORS configuration
- Environment variables via `.env`
- Health check endpoint for uptime monitoring

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Framer Motion
- Bootstrap Grid
- Custom CSS
- AVIF / WebP images
- PWA manifest

### Backend
- Node.js
- Express
- Email service (Resend / SMTP)
- CORS
- Dotenv

### Hosting / Deployment
- Frontend: **Netlify**
- Backend: **Render**
- Domain: Custom + HTTPS

---

## 📂 Project Structure

```txt
portfolio/
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── Profile.avif
│   │   │   └── Profile.webp
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   ├── apple-touch-icon.png
│   │   ├── site.webmanifest
│   │   ├── sitemap.xml          (recommended)
│   │   └── robots.txt           (recommended)
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Experience.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── Interests.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Reveal.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   │   └── contactRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── netlify.toml                (recommended for redirects + caching)
├── .gitignore
└── README.md
````

---

## ⚙️ Local Setup

### 1) Clone the repository

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
```

---

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at:

```txt
http://localhost:5173
```

---

### 3) Backend

```bash
cd ../backend
npm install
npm start
```

Runs at:

```txt
http://localhost:5000
```

---

## 🔐 Environment Variables (Backend)

Create `backend/.env`:

```env
PORT=5000
EMAIL_FROM=portfolio@yourdomain.com
EMAIL_TO=syedwaleedahmed9@gmail.com
EMAIL_API_KEY=your_email_service_key
```

> 💡 For production, **Resend** is recommended over Gmail SMTP for reliability.

---

## 📬 Contact Form Flow

1. User submits contact form
2. Frontend sends a POST request to the backend
3. Backend validates input
4. Email is sent to the configured inbox
5. Frontend receives success/error response

---

## 🌍 Deployment

### Frontend (Netlify)

* Custom domain + HTTPS
* SPA routing
* Asset caching (recommended headers)
* Redirect configuration to avoid multi-hop redirects (recommended)

### Backend (Render)

* Environment variables
* Health checks
* Auto restarts

---

## 🔍 SEO Setup (Recommended)

To improve indexing and ranking:

* ✅ Add **Google Search Console** + submit sitemap
* ✅ Add `public/sitemap.xml` and `public/robots.txt`
* ✅ Ensure a single canonical URL (prefer `https://www.syedwaleedahmed.me/`)
* ✅ Structured data (Person schema) in `index.html`

---

## 📊 Performance Notes

This project is optimized for strong Lighthouse results:

* Lazy-loaded non-critical sections
* Reduced main-thread work (throttled animations where needed)
* Deferred heavy visuals (Particles)
* Optimized LCP image (AVIF/WebP + preload)
* Zero layout shift (CLS = 0)

---

## 🤝 Contributions

Feedback, issues, and suggestions are welcome.
If you encounter any bugs or have any improvement ideas, feel free to open an issue or reach out.

---

## 📄 License

Licensed under the **MIT License**.

---

## 👋 Author

**Syed Waleed Ahmed**
