// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://syedwaleedahmed.netlify.app",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

// Health route
app.get("/health", (req, res) => {
  res.json({ message: "Backend running" });
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Contact form route
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: "Missing fields." });
  }

  const textBody = `
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject}

Message:
${message}
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,  // onboarding@resend.dev
      to: process.env.EMAIL_TO,      // your gmail
      subject: `Portfolio Message: ${subject}`,
      text: textBody,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ success: false, error: "Email failed." });
    }

    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
