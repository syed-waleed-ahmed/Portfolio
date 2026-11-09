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

// The one body every accepted submission gets, real or trapped. It carries no
// provider message id: an id only a real send could return would tell a bot
// which of its submissions the honeypot caught.
const SENT = Object.freeze({ success: true, message: "Message sent successfully." });

router.post("/", contactLimiter, async (req, res, next) => {
  const { values, error } = validateContact(req.body);
  if (error) return res.status(400).json({ success: false, error });

  // Checked after validation, so the trap changes nothing in the response: an
  // invalid submission gets the same 400 with or without the field, and a
  // valid one gets the same 200 a real send does. A bot that could tell the
  // two apart would just retry without the field. Nothing is sent. (Only the
  // timing differs, since a real send waits for Resend; see docs/api.md.)
  if (typeof req.body[HONEYPOT_FIELD] === "string" && req.body[HONEYPOT_FIELD].trim()) {
    // Logged with the sender attached on purpose. A false positive - an
    // autofill or password manager filling the trap - would otherwise lose a
    // real message silently, and the form is the only way to reach us. This
    // line is the difference between "recoverable" and "gone".
    // %j, not %s: a crafted name containing newlines could otherwise forge
    // extra log lines.
    console.warn(
      "[contact] honeypot tripped - dropping submission. name=%j email=%j",
      values.name,
      values.email
    );
    return res.json(SENT);
  }

  try {
    const { id } = await sendContactEmail(values);
    // The provider's id stays in the log, where it is useful for tracing a
    // delivery, and out of the response.
    console.log("[contact] sent id=%s", id);
    return res.json(SENT);
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
