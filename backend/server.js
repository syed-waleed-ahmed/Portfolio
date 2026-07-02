// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config, validateEnv } from "./config/env.js";
import contactRoutes from "./routes/contactRoutes.js";

// Surface missing config at boot rather than mid-request.
validateEnv();

const app = express();

// Render / proxies forward the client IP via X-Forwarded-For.
// "1" means trust the first hop only (the platform proxy).
app.set("trust proxy", 1);

// ===== Security headers =====
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // API consumed by browser on different origin
  })
);

// ===== CORS (silent reject, no leaky 500) =====
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || config.allowedOrigins.has(origin)) return cb(null, true);
      // Returning false rejects without throwing (produces a 403 with no body)
      return cb(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400, // cache preflight 24h
  })
);

// ===== Body parsing (cap to 16kb, more than a contact form needs) =====
app.use(express.json({ limit: "16kb" }));

// ===== Health Routes =====
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Portfolio backend is running" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ===== API Routes =====
app.use("/api/contact", contactRoutes);

// ===== 404 handler =====
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not found." });
});

// ===== Centralized error handler =====
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Log full error server-side, but never leak stack/message to clients
  console.error("[server] unhandled error:", err);

  if (err?.type === "entity.too.large") {
    return res.status(413).json({ success: false, error: "Payload too large." });
  }

  if (res.headersSent) return;
  res.status(500).json({
    success: false,
    error: config.isProduction
      ? "Internal server error."
      : err?.message || "Internal server error.",
  });
});

// ===== Start server =====
const server = app.listen(config.port, () => {
  console.log(`[server] running on port ${config.port}`);
});

// Graceful shutdown so platform restarts don't drop in-flight requests
const shutdown = (signal) => {
  console.log(`[server] received ${signal}, shutting down...`);
  server.close(() => {
    console.log("[server] closed");
    process.exit(0);
  });
  // Force-exit if it hangs
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
