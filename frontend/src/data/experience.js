export const experiences = [
  {
    title: "AI Engineer · Master's Thesis Internship",
    company: "MemorAIz S.r.l.",
    period: "Jan 2026 - Present · Bologna, Italy",
    bullets: [
      "Thesis: RemindrAI, a portable reminder and memory service conversational assistants adopt instead of rebuilding, built on an agent that covers Email, WhatsApp, Telegram, and Discord.",
      "Made delivery correct under failure without a queue runtime, using an atomic database claim, per-channel idempotency, and database-owned retries.",
      "Built the operator console that runs it in production: a content-blind multi-tenant control plane for plans, licences, quotas, and GDPR export and erasure.",
      "Live on an EU-pinned stack, packaged as a one-line Mastra capability, with the H-FARM Student Assistant as first tenant.",
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
