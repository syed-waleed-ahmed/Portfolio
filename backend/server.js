// backend/server.js
import { realpathSync } from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config, validateEnv } from "./config/env.js";
import contactRoutes from "./routes/contactRoutes.js";

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
      // Returning false, rather than throwing, omits Access-Control-Allow-Origin
      // and lets the request continue. The browser blocks the response on its
      // side; throwing here would surface as a 500 and advertise the allow-list.
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
app.use((err, _req, res, next) => {
  // Too late for a JSON error: hand it to Express's own handler, which closes
  // the connection, rather than leaving a half-sent response open.
  if (res.headersSent) {
    console.error("[server] error after the response started:", err);
    return next(err);
  }

  // A body the parser refused is the client's fault, not the server's:
  // malformed JSON (400), an unsupported charset or encoding (415), or the
  // 16kb cap (413). Logged by type only, never as the whole error, because
  // body-parser attaches the raw request text, which holds the sender's name,
  // address and message.
  if (err?.expose && err.status >= 400 && err.status < 500) {
    console.warn("[server] rejected body: %s (%d)", err.type, err.status);
    const error =
      err.type === "entity.too.large"
        ? "Payload too large."
        : err.type === "entity.parse.failed"
          ? "Malformed JSON body."
          : "Unsupported request body.";
    return res.status(err.status).json({ success: false, error });
  }

  // Log full error server-side, but never leak stack/message to clients
  console.error("[server] unhandled error:", err);
  res.status(500).json({
    success: false,
    error: config.isProduction
      ? "Internal server error."
      : err?.message || "Internal server error.",
  });
});

// Exported so tests can import the app without binding a port.
export default app;

// ===== Start server =====
function start() {
  // Surface missing config at boot rather than mid-request.
  validateEnv();

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
}

// Boot only when run directly (`node server.js`), not when imported by tests.
const invokedDirectly = (() => {
  try {
    return (
      process.argv[1] &&
      realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
})();

if (invokedDirectly) start();
