// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
const allowedOrigins = [
  "http://localhost:5173",
  "https://syedwaleedahmed.netlify.app",
  "https://syedwaleedahmed.me",
  "https://www.syedwaleedahmed.me",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (Postman / curl)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); // preflight
app.use(express.json());

// ===== Health Routes =====
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Portfolio backend is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ===== Resend Setup =====
const resend = new Resend(process.env.RESEND_API_KEY);

// ===== Contact Route =====
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    const to = process.env.EMAIL_TO; // your Gmail
    const from = process.env.EMAIL_FROM; // must be a verified sender on Resend

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "RESEND_API_KEY is missing on server.",
      });
    }

    if (!to || !from) {
      return res.status(500).json({
        success: false,
        error: "EMAIL_TO or EMAIL_FROM is missing on server.",
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New Portfolio Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Subject:</b> ${subject}</p>
        <hr />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email, // so you can hit "Reply" and it goes to the sender
      subject: `Portfolio: ${subject}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Email sending failed via Resend.",
      });
    }

    return res.json({
      success: true,
      message: "Email sent successfully!",
      id: data?.id,
    });
  } catch (err) {
    console.error("Contact route error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error while sending email.",
    });
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
