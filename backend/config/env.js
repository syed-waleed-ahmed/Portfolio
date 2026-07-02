// backend/config/env.js
// One place to read and normalize environment. The rest of the app imports
// `config` instead of reaching into process.env. Add new settings here.
import dotenv from "dotenv";

dotenv.config();

// Browser origins allowed to hit the API. Override with ALLOWED_ORIGINS
// (comma-separated) to add a domain without editing code.
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://syedwaleedahmed.netlify.app",
  "https://syedwaleedahmed.me",
  "https://www.syedwaleedahmed.me",
];

const parseOrigins = (raw) =>
  raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;

export const config = Object.freeze({
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "",
  emailTo: process.env.EMAIL_TO || "",
  allowedOrigins: new Set(parseOrigins(process.env.ALLOWED_ORIGINS)),
});

export const isMailerConfigured = Boolean(
  config.resendApiKey && config.emailFrom && config.emailTo
);

// Log missing vars at boot instead of finding out at request time.
export function validateEnv() {
  const missing = ["RESEND_API_KEY", "EMAIL_FROM", "EMAIL_TO"].filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    console.warn(
      `[env] missing: ${missing.join(", ")} (contact form returns 503 until set).`
    );
  }
  return missing;
}
