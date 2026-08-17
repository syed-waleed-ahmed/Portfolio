// icon: a key, not a component - Experience.jsx maps it to a component, so this
// file stays pure content (same pattern as skills.js and interests.js).
//
// period and location are separate fields rather than one pre-joined string:
// the card renders each behind its own icon, so it needs them apart.

export const experiences = [
  {
    icon: "ai",
    title: "AI Engineer · Master's Thesis",
    company: "MemorAIz S.r.l.",
    period: "Feb 2026 - Present",
    location: "Bologna, Italy",
    bullets: [
      "Thesis: RemindrAI, a reminder and memory service that assistants adopt instead of rebuilding, delivered as one agent over Email, WhatsApp, Telegram, and Discord.",
      "Made delivery correct under failure without a queue runtime: atomic database claim, per-channel idempotency, database-owned retries, and dead-lettering.",
      "Built the control plane and operator console: plans, licences and quotas as data, a content-blind audit trail, and GDPR export and erasure.",
      "Deployed EU-pinned on Vercel and published as a one-line Mastra capability, with H-FARM's Student Assistant as the first tenant.",
    ],
  },
  {
    icon: "ml",
    title: "Data Clustering & AI Model Intern",
    company: "Fruugle SIA",
    period: "Jan 2026 - Apr 2026",
    location: "Jelgava, Latvia (Remote)",
    bullets: [
      "Built an XGBoost model that matches the same grocery item across 6 Italian supermarket chains, reaching 97.5% accuracy against a 95% target.",
      "Trained a second model to classify products into 16 categories at 99.5% accuracy, using class weighting so under-represented classes were not ignored.",
      "Engineered the pipeline over 80K+ scraped products: Italian-text cleaning, a quantity parser, and hard-negative sampling for ambiguous pairs.",
      "Wrote an inference script that grouped 24K+ unsorted products, with guardrails to reject implausible matches.",
    ],
  },
  {
    icon: "stack",
    title: "Tech Trainee",
    company: "Jubilee Life Insurance Co. Ltd.",
    period: "Jan 2024 - Oct 2024",
    location: "Karachi, Pakistan",
    bullets: [
      "Rotated through web development, databases, networking, and cybersecurity, building full-stack applications with React, .NET ASP Core, PHP, and MySQL.",
      "Built ETL pipelines over 100K+ records and tuned queries and stored procedures, cutting database response times by ~40%.",
      "Automated SharePoint and CRM workflows for internal teams, reducing manual effort by ~60% and speeding up client response.",
      "Monitored threats on IBM QRadar (SIEM/SOAR/PAM) and delivered 15+ SSRS reports and Power BI dashboards for business analytics.",
    ],
  },
];
