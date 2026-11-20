// backend/config/env.js
// One place to read and normalize environment. The rest of the app imports
// `config` instead of reaching into process.env. Add new settings here.
import dotenv from "dotenv";

// `quiet` suppresses the startup banner dotenv prints by default, so the boot
// log stays limited to lines this app wrote.
dotenv.config({ quiet: true });

// Browser origins allowed to hit the API. ALLOWED_ORIGINS (comma-separated)
// REPLACES this list rather than adding to it, so repeat every default that
// should keep working; setting only a new domain locks out the live site.
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://syedwaleedahmed.me",
  "https://www.syedwaleedahmed.me",
];

// How many proxies stand between a visitor and this process, which is how
// many X-Forwarded-For entries, counted from the right, were written by
// infrastructure rather than by the client. On Render it is three, and that
// comes from measuring, not from reading: Render's documentation names
// Cloudflare and its own load balancers and never shows the header. With 1
// trusted the limiter's key was one of three addresses, with 2 one of at least
// four, and in neither case the caller's, so at least three entries are not
// the client's and three cannot be too many. With 3, nine requests from one
// machine counted down a single counter (2026-11-20, docs/audit/).
//
// The number decides what the rate limiter keys on, and both mistakes are
// silent. Too low, and the key is a proxy's address, so every visitor shares a
// handful of counters and a few requests from anyone lock the form for all.
// Too high, and the key is an entry the client wrote, so a new header value
// buys a fresh quota. A change to this number, or to the host, is finished
// only when the check in docs/deployment.md has passed against the live API.
const DEFAULT_TRUST_PROXY_HOPS = 3;

// How long a send may wait for Resend. The SDK sets no limit of its own, and
// Node's fetch waits five minutes by default, so without one a stalled
// provider would hold every submission open while its visitor is told
// nothing. Ten seconds is far longer than a healthy API call takes, and well
// inside the 60 seconds the form itself waits.
const DEFAULT_RESEND_TIMEOUT_MS = 10_000;

const parseOrigins = (raw) =>
  raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;

const isBlank = (raw) => raw === undefined || raw.trim() === "";

// A whole number of at least `min`, or undefined for anything else, unset
// included. Number("") is 0, hence the separate test for a blank value.
const readInteger = (raw, min) => {
  if (isBlank(raw)) return undefined;
  const value = Number(raw);
  return Number.isInteger(value) && value >= min ? value : undefined;
};

// An Origin header is scheme://host[:port] and nothing more, in lower case,
// and the allow-list is compared with it character for character. So an entry
// with a trailing slash, a path, an upper-case host or a wildcard can never
// match, and the only symptom is a form that stopped working in browsers.
const isOrigin = (value) => {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
};

// Pure, so the tests can read any environment without touching the real one.
export function loadConfig(env) {
  return Object.freeze({
    port: Number(env.PORT) || 5000,
    nodeEnv: env.NODE_ENV || "development",
    isProduction: env.NODE_ENV === "production",
    resendApiKey: env.RESEND_API_KEY || "",
    emailFrom: env.EMAIL_FROM || "",
    emailTo: env.EMAIL_TO || "",
    resendTimeoutMs: readInteger(env.RESEND_TIMEOUT_MS, 1) ?? DEFAULT_RESEND_TIMEOUT_MS,
    trustProxyHops: readInteger(env.TRUST_PROXY_HOPS, 0) ?? DEFAULT_TRUST_PROXY_HOPS,
    allowedOrigins: new Set(parseOrigins(env.ALLOWED_ORIGINS)),
  });
}

export const config = loadConfig(process.env);

export const isMailerConfigured = Boolean(
  config.resendApiKey && config.emailFrom && config.emailTo
);

// Everything in the environment that would otherwise go wrong without a word:
// one line per problem, each saying what happens because of it.
export function configWarnings(env) {
  const warnings = [];

  const missing = ["RESEND_API_KEY", "EMAIL_FROM", "EMAIL_TO"].filter((key) => !env[key]);
  if (missing.length > 0) {
    warnings.push(`missing: ${missing.join(", ")} (contact form returns 503 until set).`);
  }

  const notOrigins = parseOrigins(env.ALLOWED_ORIGINS).filter((origin) => !isOrigin(origin));
  if (notOrigins.length > 0) {
    // JSON-quoted, so stray whitespace or a control character shows.
    warnings.push(
      `ALLOWED_ORIGINS: ${notOrigins.map((origin) => JSON.stringify(origin)).join(", ")} can never match a browser's Origin header. ` +
        "Write each entry as scheme://host[:port], lower case, with no path or trailing slash."
    );
  }

  for (const [key, min, fallback] of [
    ["TRUST_PROXY_HOPS", 0, DEFAULT_TRUST_PROXY_HOPS],
    ["RESEND_TIMEOUT_MS", 1, DEFAULT_RESEND_TIMEOUT_MS],
  ]) {
    if (!isBlank(env[key]) && readInteger(env[key], min) === undefined) {
      warnings.push(`${key}: ${JSON.stringify(env[key])} is not a whole number of ${min} or more; using ${fallback}.`);
    }
  }

  return warnings;
}

// Log them at boot instead of finding out at request time.
export function validateEnv() {
  const warnings = configWarnings(process.env);
  for (const warning of warnings) console.warn(`[env] ${warning}`);
  return warnings;
}
