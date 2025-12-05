// server.js
import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";

// Load environment variables from .env
dotenv.config();

// Destructure env vars for convenience
const { EMAIL_USER, EMAIL_PASS, EMAIL_TO, PORT } = process.env;

if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
  console.error("❌ Missing EMAIL_USER, EMAIL_PASS, or EMAIL_TO in .env");
}

const app = express();
const port = PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite dev URL (adjust for production)
    methods: ["POST", "GET", "OPTIONS"],
  })
);
app.use(express.json());

// Nodemailer transport using your Gmail + App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Route for sending messages
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Basic server-side validation
  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields." });
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${EMAIL_USER}>`,
    to: EMAIL_TO,
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

app.listen(port, () => console.log(`Server running on port ${port}`));
