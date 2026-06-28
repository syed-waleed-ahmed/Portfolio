export const projects = [
  {
    title: "RemindrAI — Multi-Channel AI Reminder Platform",
    role: "AI Systems · MemorAIz",
    period: "2026",
    stack: ["Next.js 15", "TypeScript", "Mastra", "Vercel AI SDK", "Turso", "QStash"],
    description:
      "Production-ready serverless backend for an AI reminder + multi-channel communication platform, packaged as a drop-in Mastra capability. An AI agent holds multi-turn conversations across Email, WhatsApp, Telegram, and Discord and creates, reschedules, and cancels reminders via server-side tool calls; a serverless engine then delivers them on schedule.",
    highlight:
      "Idempotent, retryable cross-channel delivery — atomic DB claims, backoff retries, and crash recovery — consumable by any Mastra app with just a URL + token.",
  },
  {
    title: "Multi-Agent AI Workflow System",
    role: "AI/ML Project",
    period: "2025 – 2026",
    stack: ["Python", "LangGraph", "Groq", "OpenAI"],
    description:
      "Production-ready multi-agent system that automates marketing campaign generation. Specialized agents (research, copy, brief, QA) coordinate through a shared workflow, replacing what used to be a multi-day manual process.",
    highlight:
      "Cut manual effort by 90% through role-based agent orchestration with structured handoffs.",
  },
  {
    title: "Self-Correcting RAG Pipeline",
    role: "AI/ML Project",
    period: "2025 – 2026",
    stack: ["LangChain", "Vector Search", "OpenAI", "Python"],
    description:
      "RAG system with retrieve → evaluate → correct loops. The pipeline grades its own answers and re-retrieves when the evaluator flags low confidence, instead of hallucinating its way through.",
    highlight:
      "Closed the loop between retrieval and answer quality, reducing hallucinated outputs.",
  },
  {
    title: "LLM-as-Judge Evaluation Framework",
    role: "AI/ML Project",
    period: "2025",
    stack: ["LangChain", "OpenAI", "Python", "Eval"],
    description:
      "Evaluation framework that benchmarks LLM outputs against custom rubrics for quality, relevance, and creativity. Used for comparing models and tracking regressions on internal prompts.",
    highlight:
      "Custom scoring criteria let teams ship LLM features without flying blind.",
  },
  {
    title: "Visual Inspection of Connecting Rods",
    role: "Academic Project · Master's",
    period: "Oct 2024 – Jan 2025",
    stack: ["Computer Vision", "OpenCV", "Python"],
    description:
      "CV-based industrial classification system that inspects motorcycle connecting rods for defects. Replaced a slow manual inspection step on the production floor.",
    highlight:
      "95%+ classification accuracy and ~80% reduction in manual inspection time.",
  },
  {
    title: "Delay Classification for Tele-Robotic Systems",
    role: "Bachelor's Thesis",
    period: "Oct 2022 – Aug 2023",
    stack: ["Time-Series", "ML", "Python"],
    description:
      "Time-series and ML pipeline that classifies network delay across LAN, WAN, and 4G environments to keep tele-robotic control loops stable.",
    highlight:
      "~25% improvement in system stability under variable network conditions.",
  },
];
