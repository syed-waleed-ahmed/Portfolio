// Employment, in the CVs' words. A figure appears here only if a CV states it.

export interface Role {
  title: string;
  organization: string;
  period: string;
  location: string;
  bullets: string[];
  // The case study that goes deeper, where there is one.
  caseStudy?: string;
}

export const experience: Role[] = [
  {
    title: "AI Software Engineering Intern, Master's thesis",
    organization: "MemorAIz S.r.l.",
    period: "Feb 2026 - Sep 2026",
    location: "Bologna, Italy",
    caseStudy: "remindrai",
    bullets: [
      "Designed and built RemindrAI, a multi-tenant reminder and messaging backend that conversational apps embed: a tool-calling agent schedules reminders from chat and delivers them by Email, WhatsApp, Telegram and Discord.",
      "Made delivery retry-safe with atomic database claims, stale-claim recovery, per-recipient deduplication, database-held backoff, a dead-letter queue and signature-verified webhooks, with 25 failure-injection tests against real SQL.",
      "Kept user and tenant identity out of model-controlled tool arguments, so an injected prompt cannot act on another user's reminders, and built a 92-case LLM evaluation set that caught real prompt regressions.",
      "Added tenant isolation, hashed per-organization API keys, quotas, audited data export and erasure, and a Next.js operator console. H-FARM's Student Assistant integrated it as the first pilot tenant.",
      "Built the MemorAIz Onboarding Assistant, a deployed agent that interviews new clients and fills a live company profile through tool calls, with retrieval over pgvector.",
    ],
  },
  {
    title: "Data Clustering and AI Model Intern",
    organization: "Fruugle SIA",
    period: "Jan 2026 - Apr 2026",
    location: "Jelgava, Latvia (remote, part-time)",
    bullets: [
      "Framed cross-chain grocery product matching as pairwise classification and built an XGBoost matcher over 81K Italian-language records from seven supermarket chains.",
      "Reached 97.5% accuracy and 0.995 ROC-AUC on held-out product pairs. In 5-fold cross-validation it scored 97.6% against a 95.8% logistic-regression baseline, backed by feature ablations.",
      "Built the inference job, a TF-IDF candidate shortlist with brand and similarity guardrails, which scored 24K unlabelled products and proposed matches for 9.2K of them.",
    ],
  },
  {
    title: "Tech Trainee",
    organization: "Jubilee Life Insurance Co. Ltd.",
    period: "Jan 2024 - Oct 2024",
    location: "Karachi, Pakistan",
    bullets: [
      "Rotated through development, databases, networking and security operations, building internal tools with React, ASP.NET Core, PHP and MySQL and ETL pipelines over 100K+ records.",
      "Reduced database response times by about 40% by tuning SQL queries and stored procedures, and delivered 15+ SSRS and Power BI reports.",
    ],
  },
];

export interface Study {
  degree: string;
  institution: string;
  period: string;
  note?: string;
}

export const education: Study[] = [
  {
    degree: "MSc Automation Engineering",
    institution: "University of Bologna (Alma Mater Studiorum), Italy",
    period: "Oct 2024 - Oct 2026",
    note: "Thesis: RemindrAI, built at MemorAIz S.r.l.",
  },
  {
    degree: "Erasmus+ exchange",
    institution: "University of Twente, Netherlands",
    period: "Sep 2025 - Jan 2026",
    note: "Machine Learning I and II, Deep Learning",
  },
  {
    degree: "BE Electrical Engineering",
    institution: "NED University of Engineering and Technology, Karachi, Pakistan",
    period: "Oct 2019 - Aug 2023",
  },
];
