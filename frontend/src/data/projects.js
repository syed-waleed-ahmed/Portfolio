export const projects = [
  {
    title: "RemindrAI: Multi-Channel AI Reminder Backend",
    role: "Master's Thesis · MemorAIz",
    period: "2026",
    stack: ["Next.js 15", "TypeScript", "Vercel AI SDK", "Mastra"],
    description:
      "My Master's thesis capstone: a serverless backend for an AI reminder service. An agent chats across Email, WhatsApp, Telegram, and Discord to set reminders from plain conversation, while a background engine delivers them reliably on time.",
    highlight:
      "Reliable delivery with retries and no duplicate sends, reusable in any app as a one-line Mastra tool.",
  },
  {
    title: "Modular AI Educational Assistant",
    role: "AI Systems · MemorAIz × H-FARM",
    period: "2026",
    stack: ["Next.js", "React", "RAG / pgvector", "OpenAI"],
    description:
      "A learning platform built as a shared AI core (LLM routing, RAG, and memory) with swappable feature plugins. I built the split-pane Canvas UI and the RAG features that turn lecture transcripts into quizzes, stories, and audioguides.",
    highlight:
      "New subjects ship as plugins that slot into the shared core, so the platform grows without rewrites.",
  },
  {
    title: "Multi-Agent AI Workflow System",
    role: "AI/ML Project",
    period: "2025 - 2026",
    stack: ["Python", "LangGraph", "Groq", "OpenAI"],
    description:
      "A multi-agent system that automates marketing campaign generation. Specialized agents for research, copy, brief, and QA coordinate through a shared workflow, replacing what used to be a multi-day manual process and keeping quality consistent across runs.",
    highlight:
      "Cut manual effort by 90% through role-based agent orchestration with structured handoffs.",
  },
  {
    title: "Self-Correcting RAG Pipeline",
    role: "AI/ML Project",
    period: "2025 - 2026",
    stack: ["LangChain", "Vector Search", "OpenAI", "Python"],
    description:
      "A RAG pipeline with retrieve → evaluate → correct loops. It grades its own answers and re-retrieves whenever the evaluator flags low confidence, instead of hallucinating its way through, so responses stay grounded in the source documents.",
    highlight:
      "Closed the loop between retrieval and answer quality, cutting hallucinated outputs on ambiguous queries.",
  },
  {
    title: "Visual Inspection of Connecting Rods",
    role: "Academic Project · Master's",
    period: "Oct 2024 - Jan 2025",
    stack: ["Computer Vision", "OpenCV", "Python", "scikit-learn"],
    description:
      "A computer-vision classification system that inspects motorcycle connecting rods for defects on the production line. It replaced a slow manual step, flagging faulty parts automatically from camera images before they moved downstream.",
    highlight:
      "95%+ classification accuracy with ~80% less manual inspection time on the floor.",
  },
  {
    title: "Delay Classification for Tele-Robotic Systems",
    role: "Bachelor's Thesis",
    period: "Oct 2022 - Aug 2023",
    stack: ["Signal Processing", "TCP/IP", "UDP" ,"Networking", "C++"],
    description:
      "A time-series and ML pipeline that classifies network delay across LAN, WAN, and 4G environments. Built from captured latency traces, it flags the conditions that would destabilize a remote tele-robotic control loop before they cause failures.",
    highlight:
      "~25% improvement in control-loop stability under variable network conditions.",
  },
];
