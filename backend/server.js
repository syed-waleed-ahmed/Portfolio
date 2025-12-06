// backend/server.js
import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["POST", "GET", "OPTIONS"],
  })
);

app.use(express.json());

// Simple health check route (useful for Render/monitors)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Portfolio backend is running" });
});

// ===== Nodemailer transport (Gmail + App Password) =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===== Contact Route =====
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields." });
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `New Portfolio Message: ${subject}`,
    text: `
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject}

Message:
${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({
      success: false,
      error: "Email sending failed. Please try again later.",
    });
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
