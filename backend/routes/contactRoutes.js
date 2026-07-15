// backend/routes/contactRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  sendContactEmail,
  MailerNotConfiguredError,
  EmailDeliveryError,
} from "../services/mailerService.js";

const router = express.Router();

// Field rules in one table so adding a field is a one-line change.
const FIELDS = {
  name: { max: 100 },
  email: { max: 100 },
  subject: { max: 200 },
  message: { max: 5000 },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Honeypot: a field the form hides from people but bots tend to fill. Named
// something a scraper would want to autofill rather than anything suggesting a
// trap. Must match the input name in Contact.jsx.
const HONEYPOT_FIELD = "website";

// 5 submissions per IP per 15 min. Keyed on the real client IP thanks to
// `trust proxy` in server.js.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
});

// Returns { values } on success or { error } with the first problem found.
function validateContact(body = {}) {
  const values = {};

  for (const [key, rules] of Object.entries(FIELDS)) {
    const value = typeof body[key] === "string" ? body[key].trim() : "";
    if (!value) return { error: `Missing required field: ${key}.` };
    if (value.length > rules.max) return { error: `Field "${key}" is too long.` };
    values[key] = value;
  }

  if (!EMAIL_RE.test(values.email)) return { error: "Invalid email address." };

  return { values };
}

router.post("/", contactLimiter, async (req, res, next) => {
  // Checked before validation, and answered with the same 200 a real send
  // gets: a bot that could tell rejection from success would just retry
  // without the field. Nothing is sent and nothing is logged as an error.
  if (typeof req.body?.[HONEYPOT_FIELD] === "string" && req.body[HONEYPOT_FIELD].trim()) {
    // Logged with the sender attached on purpose. A false positive - an
    // autofill or password manager filling the trap - would otherwise lose a
    // real message silently, and the form is the only way to reach us. This
    // line is the difference between "recoverable" and "gone".
    // %j, not %s: a crafted name containing newlines could otherwise forge
    // extra log lines.
    console.warn(
      "[contact] honeypot tripped - dropping submission. name=%j email=%j",
      typeof req.body.name === "string" ? req.body.name.slice(0, 100) : "",
      typeof req.body.email === "string" ? req.body.email.slice(0, 100) : ""
    );
    return res.json({ success: true, message: "Message sent successfully." });
  }

  const { values, error } = validateContact(req.body);
  if (error) return res.status(400).json({ success: false, error });

  try {
    const { id } = await sendContactEmail(values);
    return res.json({ success: true, message: "Message sent successfully.", id });
  } catch (err) {
    if (err instanceof MailerNotConfiguredError) {
      console.error("[contact] mailer not configured");
      return res.status(503).json({ success: false, error: err.message });
    }
    if (err instanceof EmailDeliveryError) {
      console.error("[contact] delivery failed:", err.cause);
      return res.status(502).json({ success: false, error: err.message });
    }
    return next(err);
  }
});

export default router;
