// backend/services/mailerService.js
// All email delivery lives here. Routes call sendContactEmail() instead of
// touching the Resend SDK, so future features (auto-reply, alerts) reuse it.
import { Resend } from "resend";
import { config, isMailerConfigured } from "../config/env.js";

const resend = isMailerConfigured ? new Resend(config.resendApiKey) : null;

// ===== Email template branding =====
// Tweak these to restyle every contact email. Colors match the portfolio.
const BRAND = {
  name: "Syed Waleed Ahmed",
  accent: "#6366f1", // indigo — header + button
  accent2: "#22d3ee", // cyan — accent stripe
  ink: "#0a0e1a", // near-black text
  muted: "#6b7280", // labels / footer
  border: "#e5e7eb", // hairlines
  panel: "#f4f5fb", // message box background
};

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Flatten CR/LF and other control chars in header-bound fields (subject,
// reply-to) so a crafted value can't inject extra email headers.
const sanitizeHeader = (str) =>
  String(str)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Mailer isn't configured -> route turns this into a 503.
export class MailerNotConfiguredError extends Error {
  constructor() {
    super("Email service is not configured.");
    this.name = "MailerNotConfiguredError";
  }
}

// Provider rejected the send -> route turns this into a 502.
export class EmailDeliveryError extends Error {
  constructor(cause) {
    super("Email delivery failed.");
    this.name = "EmailDeliveryError";
    this.cause = cause;
  }
}

// Caller validates and trims the fields; here we own escaping, header
// sanitization, and the actual send.
export async function sendContactEmail({ name, email, subject, message }) {
  if (!resend) throw new MailerNotConfiguredError();

  const safeSubject = sanitizeHeader(subject).slice(0, 200);
  const safeReplyTo = sanitizeHeader(email);

  const html = renderContactEmail({ name, email, subject, message });
  const text = renderContactText({ name, email, subject, message });

  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: config.emailTo,
    replyTo: safeReplyTo,
    subject: `Portfolio: ${safeSubject}`,
    html,
    text,
  });

  if (error) throw new EmailDeliveryError(error);

  return { id: data?.id };
}

// ===== Email templates =====
// A row of "Label: value" inside the details table. Keeps the markup DRY.
function detailRow(label, valueHtml) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font:600 12px/1.4 Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:${BRAND.muted};width:90px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font:400 15px/1.5 Arial,sans-serif;color:${BRAND.ink};">${valueHtml}</td>
    </tr>`;
}

// HTML email. Table-based + inline styles so it survives Gmail/Outlook/Apple
// Mail, which strip <style> blocks and most modern CSS. Edit BRAND above to
// recolor, or tweak the markup here to change layout.
function renderContactEmail({ name, email, subject, message }) {
  const when = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);

  return `
  <div style="margin:0;padding:24px 12px;background:#eef0f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
      <tr>
        <td style="background-color:${BRAND.accent};background:linear-gradient(135deg,${BRAND.accent},${BRAND.accent2});border-radius:14px 14px 0 0;padding:26px 28px;">
          <div style="font:700 11px/1 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.8);">New Contact Message</div>
          <div style="margin-top:8px;font:700 22px/1.25 Arial,sans-serif;color:#ffffff;">${BRAND.name}&rsquo;s Portfolio</div>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;padding:28px;border:1px solid ${BRAND.border};border-top:none;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${detailRow("From", `<strong>${safeName}</strong>`)}
            ${detailRow("Email", `<a href="mailto:${safeEmail}" style="color:${BRAND.accent};text-decoration:none;">${safeEmail}</a>`)}
            ${detailRow("Subject", escapeHtml(subject))}
            ${detailRow("Received", escapeHtml(when))}
          </table>

          <div style="margin:22px 0 8px;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:${BRAND.muted};">Message</div>
          <div style="background:${BRAND.panel};border-left:3px solid ${BRAND.accent};border-radius:8px;padding:16px 18px;font:400 15px/1.65 Arial,sans-serif;color:${BRAND.ink};white-space:pre-wrap;">${escapeHtml(message)}</div>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="border-radius:8px;background-color:${BRAND.accent};">
                <a href="mailto:${safeEmail}?subject=${encodeURIComponent("Re: " + subject)}" style="display:inline-block;padding:12px 22px;font:600 14px/1 Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:8px;">Reply to ${safeName} &rarr;</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;background:#ffffff;border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 14px 14px;font:400 12px/1.5 Arial,sans-serif;color:${BRAND.muted};">
          Sent from the contact form on your portfolio. Reply directly to reach ${safeName}.
        </td>
      </tr>
    </table>
  </div>`;
}

// Plain-text fallback. Improves deliverability (spam filters like a text part)
// and renders in clients with HTML disabled.
function renderContactText({ name, email, subject, message }) {
  return [
    "NEW CONTACT MESSAGE",
    "",
    `From:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
    "",
    "— Sent from your portfolio contact form. Reply directly to respond.",
  ].join("\n");
}
