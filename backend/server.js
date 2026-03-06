// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
const allowedOrigins = [
  "http://localhost:5173",
  "https://syedwaleedahmed.netlify.app",
  "https://syedwaleedahmed.me",
  "https://www.syedwaleedahmed.me",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.use(express.json());

// ===== Health Routes =====
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Portfolio backend is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ===== API Routes =====
app.use("/api/contact", contactRoutes);

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
