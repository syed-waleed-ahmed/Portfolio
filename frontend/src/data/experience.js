// period and location are separate fields rather than one pre-joined string:
// the Experience list renders each in its own slot, so it needs them apart.

export const experiences = [
  {
    title: "AI Engineer · Master's Thesis",
    company: "MemorAIz S.r.l.",
    period: "Feb 2026 - Present",
    location: "Bologna, Italy",
    bullets: [
      "Built RemindrAI for my thesis: a multi-tenant reminder backend, its operator console, and the Mastra capability other AI assistants register in one line.",
      "Made delivery retry-safe with an atomic database claim, per-channel idempotency, and database-owned backoff; median claim latency stayed near-flat from 1K to 100K due reminders.",
      "Engineered the control plane: per-organization API keys, tenant isolation at four independent depths, plans and quotas as data, and audited GDPR export and erasure.",
      "Shipped EU-pinned on Vercel under 985 tests across three repositories, with H-FARM's Student Assistant as the first production tenant.",
    ],
  },
  {
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
    title: "Tech Trainee",
    company: "Jubilee Life Insurance Co. Ltd.",
    period: "Jan 2024 - Oct 2024",
    location: "Karachi, Pakistan",
    bullets: [
      "Rotated through web development, databases, networking, and cybersecurity, building full-stack applications with React, ASP.NET Core, PHP, and MySQL.",
      "Built ETL pipelines over 100K+ records and tuned queries and stored procedures, cutting database response times by ~40%.",
      "Automated SharePoint and CRM workflows for internal teams, reducing manual effort by ~60% and speeding up client response.",
      "Monitored threats on IBM QRadar (SIEM/SOAR/PAM) and delivered 15+ SSRS reports and Power BI dashboards for business analytics.",
    ],
  },
];
