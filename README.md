# 🌐 Personal Portfolio Website

A modern, responsive, animated **Personal Portfolio Website** built using **React + Vite** for the frontend and **Node.js + Express + Nodemailer** for the backend.
The website features a beautiful UI design, smooth animations, and a fully functional contact form that sends messages directly to your Gmail inbox.

---

## 🚀 Live Demo

👉 Coming soon…

---

## ✨ Features

### 🎨 Frontend

* Built with **React + Vite**
* Beautiful animated **Hero section**
* Smooth fade-in scroll animations with Framer Motion
* Responsive and modern UI (glassmorphism + soft gradients)
* Sections included:

  * About
  * Experience
  * Projects
  * Skills
  * Interests
  * Contact Form
* Custom styled contact inputs and animated buttons
* “Currently Exploring” dynamic rotating pill

### 📨 Backend

* Built with **Node.js + Express**
* Email sending via **Nodemailer + Gmail App Password**
* Backend validation
* CORS enabled
* Secure environment variables using `.env`

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Framer Motion
* Bootstrap Grid
* Custom CSS

### Backend

* Node.js
* Express
* Nodemailer
* CORS
* Dotenv

---

## 📂 Folder Structure

```
portfolio/
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Experience.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── Interests.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── Reveal.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
│── backend/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── node_modules/
│
│── .gitignore
│── README.md
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/portfolio.git
cd portfolio
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 📨 Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs at:

```
http://localhost:5000
```

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_generated_app_password
EMAIL_TO=yourgmail@gmail.com
PORT=5000
```

To generate Gmail App Password:

1. Enable **2-Step Verification**
2. Visit **Google App Passwords**
3. Create a new password (choose "Other")
4. Paste it into `EMAIL_PASS`

---

## 📬 Contact Form Logic

The frontend sends a POST request:

```js
fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form)
});
```

Backend receives and emails the message using Nodemailer.

---

## 🌍 Deployment

### Frontend options:

* Vercel
* Netlify
* GitHub Pages

### Backend options:

* Render (recommended)
* Railway
* Vercel Serverless Functions

⚠️ Update your frontend API URL if the backend is deployed separately.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a PR.

---

## ⭐ Show Your Support

If you like this project, please ⭐ the repository.

---

## 📄 License

This project is licensed under the **MIT License**.

---
