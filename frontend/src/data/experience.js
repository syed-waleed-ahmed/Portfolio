export const experiences = [
  {
    title: "AI Systems Thesis Student",
    company: "MemorAIz",
    period: "Feb 2026 – Present · Bologna, Italy",
    bullets: [
      "Built and deployed RemindrAI — a production-ready, serverless AI reminder & multi-channel communication backend (Next.js 15, TypeScript) on Vercel, packaged as a reusable Mastra capability other apps integrate with just a URL + token.",
      "Engineered a multi-turn AI agent (Vercel AI SDK + OpenAI) with server-side tool calling and persistent per-channel memory that creates, reschedules, and cancels reminders across Email, WhatsApp, Telegram, and Discord.",
      "Designed a serverless reminder engine with idempotent, retryable cross-channel delivery: atomic DB claims (Turso/libSQL), exponential backoff + jitter retries, a crash-recovery reaper, and an Upstash QStash queue.",
      "Hardened the service to production standards: constant-time bearer auth, signature-verified webhooks (Twilio/Telegram/Discord/Svix), CSP + HSTS headers, distributed rate limiting, per-user data isolation, and full CI gates (typecheck, lint, dead-code, build).",
    ],
  },
  {
    title: "Data Analytics & AI Intern",
    company: "Fruugle SIA",
    period: "Jan 2026 – Apr 2026 · Riga, Latvia (Remote)",
    bullets: [
      "Processed and engineered 1M+ retail records to feed multimodal AI pipelines for product comparison and recommendation.",
      "Built clustering models with K-Means, DBSCAN, and hierarchical clustering to improve product grouping and price comparison accuracy.",
      "Sharpened recommendation logic by combining text, image, and numerical signals for closer product matches.",
      "Shipped dashboards and analytical insights that fed pricing strategy and day-to-day product decisions.",
    ],
  },
  {
    title: "Tech Trainee",
    company: "Jubilee Life Insurance Co. Ltd.",
    period: "Jan 2024 – Oct 2024 · Karachi, Pakistan",
    bullets: [
      "Built ETL pipelines on 100K+ records and improved query and database performance by ~40%.",
      "Developed full-stack apps with React, .NET ASP Core, MySQL, and REST APIs, plus Power BI dashboards for business analytics.",
      "Automated SharePoint and internal business workflows, cutting manual effort by ~60%.",
      "Analyzed system and security data with IBM QRadar to flag anomalies and support operational monitoring.",
    ],
  },
];
