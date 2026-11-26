// Delivers a contact message through Resend's REST API. Everything a visitor
// typed is escaped for HTML, flattened for headers and URL-encoded where it
// becomes part of a mailto: link.
import type { ContactValues } from "../src/shared/contact.ts";
import type { Env } from "./env.ts";

export const RESEND_URL = "https://api.resend.com/emails";
// Far longer than a healthy call takes, and well inside the 20 seconds the
// form waits.
export const SEND_TIMEOUT_MS = 10_000;

// Resend refused the message, could not be reached, or did not answer in time.
export class EmailDeliveryError extends Error {
  status: number | undefined;
  constructor(reason: string, status?: number) {
    super(`Email delivery failed: ${reason}`);
    this.name = "EmailDeliveryError";
    this.status = status;
  }
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Control characters become spaces in anything that lands in a header or a
// one-line field, so a value cannot add a header or forge a line.
// eslint-disable-next-line no-control-regex
const oneLine = (value: string) => value.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();

// The address goes into mailto: links, a URL, where HTML escaping is not
// enough: an address may contain "?", "&" and "=", which would let a sender add
// a bcc or a subject to the reply. Encoded first, with "@" kept readable.
const mailto = (email: string, subject?: string) =>
  escapeHtml(`mailto:${encodeURIComponent(email).replace(/%40/g, "@")}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`);

export interface Message {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}

export function composeMessage(fields: ContactValues, receivedAt: Date = new Date()): Message {
  // An unpaired surrogate is legal in a JavaScript string but has no UTF-8
  // form, and encodeURIComponent throws on one: each becomes U+FFFD here.
  const name = fields.name.toWellFormed();
  const email = fields.email.toWellFormed();
  const subject = fields.subject.toWellFormed();
  const message = fields.message.toWellFormed();
  const when = `${receivedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px 8px 0;color:#5b6068;font:600 12px Arial,sans-serif;text-transform:uppercase;vertical-align:top">${label}</td><td style="padding:8px 0;font:15px Arial,sans-serif;color:#16181d">${value}</td></tr>`;

  const html = `<div style="background:#f7f6f2;padding:24px 12px;font-family:Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #d6d2c7;border-radius:8px">
<tr><td style="padding:24px 28px;border-bottom:3px solid #92290a"><div style="font:700 13px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#92290a">New message from the portfolio</div></td></tr>
<tr><td style="padding:20px 28px"><table role="presentation" cellpadding="0" cellspacing="0">
${row("From", `<strong>${escapeHtml(name)}</strong>`)}
${row("Email", `<a href="${mailto(email)}" style="color:#92290a">${escapeHtml(email)}</a>`)}
${row("Subject", escapeHtml(subject))}
${row("Received", escapeHtml(when))}
</table>
<div style="margin-top:16px;padding:16px;background:#f7f6f2;border-radius:6px;font:15px/1.6 Arial,sans-serif;color:#16181d;white-space:pre-wrap">${escapeHtml(message)}</div>
<p style="margin-top:20px"><a href="${mailto(email, `Re: ${subject}`)}" style="display:inline-block;padding:10px 18px;background:#92290a;color:#ffffff;border-radius:4px;text-decoration:none;font:600 14px Arial,sans-serif">Reply to ${escapeHtml(name)}</a></p>
</td></tr></table></div>`;

  // A plain-text part, for clients without HTML and for spam filters.
  const text = [
    "New message from the portfolio",
    "",
    `From:    ${oneLine(name)}`,
    `Email:   ${oneLine(email)}`,
    `Subject: ${oneLine(subject)}`,
    `Received: ${when}`,
    "",
    message,
  ].join("\n");

  return { subject: `Portfolio: ${oneLine(subject).slice(0, 200)}`, html, text, replyTo: oneLine(email) };
}

export async function sendContactEmail(fields: ContactValues, env: Env, fetcher: typeof fetch = fetch): Promise<void> {
  const message = composeMessage(fields);
  let response: Response;
  try {
    response = await fetcher(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [env.EMAIL_TO], reply_to: message.replyTo, subject: message.subject, html: message.html, text: message.text }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    throw new EmailDeliveryError(timedOut ? `no answer within ${SEND_TIMEOUT_MS} ms` : "Resend could not be reached");
  }
  if (!response.ok) throw new EmailDeliveryError(`Resend answered ${response.status}`, response.status);
}
