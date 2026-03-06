// backend/routes/contactRoutes.js
import express from "express";
import { Resend } from "resend";

const router = express.Router();
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ===== Helpers =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Simple in-memory rate limiter: max 5 submissions per IP per 15 min
const rateMap = new Map();
const RATE_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

// ===== POST /api/contact =====
router.post("/", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (isRateLimited(ip)) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
      });
    }

    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    if (
      name.length > 100 ||
      email.length > 100 ||
      (phone && phone.length > 25) ||
      subject.length > 200 ||
      message.length > 5000
    ) {
      return res
        .status(400)
        .json({ success: false, error: "One or more fields exceed the maximum length." });
    }

    const to = process.env.EMAIL_TO;
    const from = process.env.EMAIL_FROM;

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
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Phone:</b> ${escapeHtml(phone || "N/A")}</p>
        <p><b>Subject:</b> ${escapeHtml(subject)}</p>
        <hr />
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
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

export default router;
