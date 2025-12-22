import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
const allowedOrigins = new Set([
  "http://localhost:5173",

  // Netlify default domain for this portfolio
  "https://syedwaleedahmed.netlify.app",

  // Your custom domain
  "https://syedwaleedahmed.me",
  "https://www.syedwaleedahmed.me",
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl / postman (no origin)
      if (!origin) return cb(null, true);

      if (allowedOrigins.has(origin)) return cb(null, true);

      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 200,
  })
);

// IMPORTANT: explicitly handle preflight
app.options("*", cors());

app.use(express.json());

// Health routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Portfolio backend is running" });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ===== Nodemailer transport =====
// NOTE: Gmail SMTP often times out on Render free tier.
// If you moved to Resend, you will replace this section.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields." });
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `New Portfolio Message: ${subject}`,
    text: `Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject}

Message:
${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({
      success: false,
      error: "Email sending failed. Please try again later.",
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
