# 🌐 Syed Waleed Ahmed — Personal Portfolio Website

A modern, responsive, and animated **personal portfolio website** built with **React + Vite** on the frontend and **Node.js + Express** on the backend.
The project focuses on **performance, accessibility, clean UI/UX**, and a **fully functional contact system**.

🔗 **Live Website:**
👉 https://syedwaleedahmed.me/

---

## ✨ Highlights

* ⚡ Fast & lightweight (Vite + optimized assets)
* 🎨 Modern UI with glassmorphism & soft gradients
* 🎥 Smooth animations using **Framer Motion**
* 📱 Fully responsive (desktop, tablet, mobile)
* 📨 Working contact form with backend email delivery
* 🔍 SEO-friendly + Lighthouse optimized
* 🌐 Custom domain + HTTPS

---

## 🧩 Features

### 🎨 Frontend

* **React + Vite**
* Hero section with parallax & animated text
* Scroll-based reveal animations
* “Currently Exploring” rotating tech pill
* Skills section with animated progress bars
* Optimized hero image using **AVIF + WebP**
* Custom favicon & PWA manifest
* Accessible components (ARIA-aware)

**Sections included:**

* Home / Hero
* About
* Experience
* Projects
* Skills
* Interests
* Contact

---

### 📨 Backend

* **Node.js + Express**
* Contact form email delivery
* Email provider support (Resend / SMTP)
* Backend validation
* CORS configuration
* Secure environment variables using `.env`
* Health check endpoint for uptime monitoring

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Framer Motion
* Bootstrap Grid
* Custom CSS
* AVIF / WebP images

### Backend

* Node.js
* Express
* Email service (Resend / SMTP)
* CORS
* Dotenv

---

## 📂 Project Structure

```
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
│   │   └── site.webmanifest
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
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs at:

```
http://localhost:5173
```

---

### 📨 Backend Setup

```bash
cd backend
npm install
npm start
```

Runs at:

```
http://localhost:5000
```

---

## 🔐 Environment Variables (Backend)

Create `backend/.env`:

```
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
4. Email is sent to your inbox
5. A success or error message is returned to the frontend

---

## 🌍 Deployment

### Frontend

Deployed on **Netlify** with:

* Custom domain
* Automatic HTTPS
* Asset caching
* SPA routing

### Backend

Deployed on **Render** with:

* Health checks
* Environment variables
* Auto restarts

---

## 📊 Performance & SEO

* Lighthouse optimized
* AVIF/WebP hero image
* Proper meta tags
* Accessible headings & labels
* Zero layout shift (CLS = 0)

---

## 🤝 Contributions

Feedback, issues, and suggestions are welcome.

If you encounter any rendering issues or have suggestions for improvement, please don't hesitate to open an issue or reach out.

---

## 📄 License

This project is licensed under the **MIT License**.

---

### 👋 Author

**Syed Waleed Ahmed**
Master’s student in Automation Engineering — University of Bologna
AI • ML • Intelligent Automation • Full-Stack Engineering
