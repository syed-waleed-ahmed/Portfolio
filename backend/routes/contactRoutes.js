// backend/routes/contactRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";

const router = express.Router();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ===== Helpers =====
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Validate required string fields with length caps
const FIELDS = {
  name: { max: 100, required: true },
  email: { max: 100, required: true },
  subject: { max: 200, required: true },
  message: { max: 5000, required: true },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== Rate limiter (5 submissions per IP per 15 min) =====
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

// ===== POST /api/contact =====
router.post("/", contactLimiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};

    // Required fields + length validation in one pass
    for (const [key, rules] of Object.entries(FIELDS)) {
      const value = typeof body[key] === "string" ? body[key].trim() : "";
      if (rules.required && !value) {
        return res
          .status(400)
          .json({ success: false, error: `Missing required field: ${key}.` });
      }
      if (value.length > rules.max) {
        return res.status(400).json({
          success: false,
          error: `Field "${key}" exceeds maximum length.`,
        });
      }
    }

    if (!EMAIL_RE.test(body.email.trim())) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email address." });
    }

    const to = process.env.EMAIL_TO;
    const from = process.env.EMAIL_FROM;

    if (!resend || !to || !from) {
      console.error("[contact] mailer not configured (check env vars)");
      return res.status(503).json({
        success: false,
        error: "Email service is temporarily unavailable.",
      });
    }

    const name = body.name.trim();
    const email = body.email.trim();
    const subject = body.subject.trim();
    const message = body.message.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New Portfolio Message</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
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
      console.error("[contact] resend error:", error);
      return res
        .status(502)
        .json({ success: false, error: "Email delivery failed." });
    }

    return res.json({
      success: true,
      message: "Message sent successfully.",
      id: data?.id,
    });
  } catch (err) {
    // Hand off to the central error handler in server.js
    next(err);
  }
});

export default router;
