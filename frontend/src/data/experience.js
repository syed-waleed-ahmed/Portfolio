export const experiences = [
  {
    title: "AI Systems Thesis Student",
    company: "MemorAIz",
    period: "Feb 2026 – Present · Bologna, Italy",
    bullets: [
      "Built RemindrAI, a serverless AI backend that schedules reminders and chats with users over Email, WhatsApp, Telegram, and Discord.",
      "Wired up an AI agent on the Vercel AI SDK that creates, reschedules, and cancels reminders straight from chat messages.",
      "Made delivery reliable with retries, no duplicate sends, and automatic recovery from crashed jobs.",
      "Packaged the backend as a reusable Mastra tool other apps can plug in, secured with auth and signed webhooks.",
    ],
  },
  {
    title: "Data Clustering & AI Model Intern",
    company: "Fruugle SIA",
    period: "Jan 2026 – Apr 2026 · Jelgava, Latvia (Remote)",
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
    period: "Jan 2024 – Oct 2024 · Karachi, Pakistan",
    bullets: [
      "Built ETL pipelines on 100K+ records and improved query and database performance by ~40%.",
      "Developed full-stack apps with React, .NET ASP Core, MySQL, and REST APIs, plus Power BI dashboards for business analytics.",
      "Automated SharePoint and internal business workflows, cutting manual effort by ~60%.",
      "Analyzed system and security data with IBM QRadar to flag anomalies and support operational monitoring.",
    ],
  },
];
