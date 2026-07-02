export const experiences = [
  {
    title: "AI Systems Thesis",
    company: "MemorAIz",
    period: "Jan 2026 - Present · Bologna, Italy",
    bullets: [
      "Thesis capstone: built RemindrAI, a production serverless backend where an AI agent schedules reminders and chats with users over Email, WhatsApp, Telegram, and Discord.",
      "Wired an OpenAI agent on the Vercel AI SDK that creates, reschedules, and cancels reminders straight from chat, with memory that persists per channel.",
      "Made delivery reliable with automatic retries, crash recovery, and no duplicate sends, then packaged the backend as a drop-in Mastra capability other apps add in one line.",
      "Got there through the building blocks: an AI onboarding platform for energy communities (GPT-4o Vision) and a modular RAG-based educational assistant.",
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
