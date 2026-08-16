export const experiences = [
  {
    title: "AI Engineer · Master's Thesis Internship",
    company: "MemorAIz S.r.l.",
    period: "Jan 2026 - Present · Bologna, Italy",
    bullets: [
      "Thesis: RemindrAI, a reminder and memory service assistants adopt instead of rebuilding — one agent over Email, WhatsApp, Telegram, Discord.",
      "Made delivery correct under failure with no queue runtime: atomic database claim, per-channel idempotency, DB-owned retries, dead-lettering.",
      "Built the control plane and operator console: plans, licences and quotas as data, a content-blind audit trail, GDPR export and erasure.",
      "Live EU-pinned on Vercel, published as a one-line Mastra capability, with H-FARM's Student Assistant as first tenant.",
    ],
  },
  {
    title: "Data Clustering & AI Model Intern",
    company: "Fruugle SIA",
    period: "Jan 2026 - Apr 2026 · Jelgava, Latvia (Remote)",
    bullets: [
      "Built an XGBoost model that matches the same grocery item across 6 Italian supermarket chains, hitting 97.5% accuracy against a 95% target.",
      "Trained a second model to sort products into 16 categories at 99.5% accuracy, with class weighting so the rare ones weren't ignored.",
      "Engineered the pipeline over 80K+ scraped products: Italian-text cleaning, a quantity parser, and hard-negative sampling for the tricky pairs.",
      "Wrote an inference script that grouped 24K+ unsorted products, with guardrails to block matches that were obviously wrong.",
    ],
  },
  {
    title: "Tech Trainee",
    company: "Jubilee Life Insurance Co. Ltd.",
    period: "Jan 2024 - Oct 2024 · Karachi, Pakistan",
    bullets: [
      "Rotated through web development, databases, networking, and cybersecurity, building full-stack apps with React, .NET ASP Core, PHP, and MySQL.",
      "Built ETL pipelines over 100K+ records and tuned queries and stored procedures, cutting database response times by ~40%.",
      "Automated SharePoint and CRM workflows for internal teams, reducing manual effort by ~60% and speeding up client response.",
      "Monitored threats on IBM QRadar (SIEM/SOAR/PAM) and delivered 15+ SSRS reports and Power BI dashboards for business analytics.",
    ],
  },
];
