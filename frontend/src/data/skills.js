// A tag earns its place by being something someone could reasonably interview
// on. Editors and version control (VS Code, Jupyter, Git) and the assumed
// baseline behind a framework already listed (HTML/CSS under React) were cut
// for that reason: they pad the count without adding a claim.
//
// Each tag sits in the group a reader would look for it in: Twilio and
// Upstash QStash are messaging, and Power BI is analytics, not DevOps.
export const skillGroups = [
  {
    title: "AI / LLM Engineering",
    tags: [
      "Multi-Agent Systems",
      "RAG",
      "LLM Evaluation",
      "Prompt Engineering",
      "Fine-tuning",
      "llama.cpp",
      "Mastra",
      "Vercel AI SDK",
      "LangChain",
      "LangGraph",
      "CrewAI",
      "LiteLLM",
      "Hugging Face",
      "OpenAI",
      "Groq",
    ],
  },
  {
    title: "ML & Data",
    tags: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "XGBoost",
      "OpenCV",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "Statistical Analysis",
      "Power BI",
    ],
  },
  {
    title: "Languages",
    tags: ["Python", "TypeScript", "JavaScript", "SQL", "C++"],
  },
  {
    title: "Web & Backend",
    tags: [
      "React",
      "Next.js",
      "Server Components",
      "Node.js",
      "FastAPI",
      "ASP.NET Core",
      "REST APIs",
      "Serverless",
      "Multi-Tenancy",
      "Webhooks",
      "Vitest",
    ],
  },
  {
    title: "Data & Messaging",
    tags: [
      "PostgreSQL",
      "MySQL",
      "SQL Server",
      "MongoDB",
      "Turso / libSQL",
      "pgvector",
      "Drizzle ORM",
      "Redis",
      "Kafka",
      "Upstash QStash",
      "Twilio",
    ],
  },
  {
    title: "Cloud & DevOps",
    tags: [
      "AWS",
      "Vercel",
      "Google Cloud Run",
      "Cloudflare Workers",
      "Docker",
      "Kubernetes",
      "Terraform",
      "CI/CD",
      "Linux",
    ],
  },
];

// The skills the work on this page is built on, shown above the full
// inventory as a block of their own, each with where it was used. A skill is
// here only if the Projects or Experience entries show it carrying a system,
// and `proof` names those entries: a project by the part of its title before
// the colon, the MemorAIz Onboarding Assistant by the name its Experience
// bullet gives it, or a count of the six projects. A content test checks
// every name against the entries and every count against the stacks, so a
// proof cannot outlive the card it points at.
// No levels and no years: the evidence is the entries, not a bar.
export const coreSkills = [
  { name: "Multi-Agent Systems", proof: "Multi-Agent Research Team, Self-Correcting Multi-Agent RAG" },
  { name: "RAG", proof: "Self-Correcting Multi-Agent RAG, MemorAIz Onboarding Assistant" },
  { name: "LLM Evaluation", proof: "LLM-as-Judge, FastAPI Niche Assistant" },
  { name: "Python", proof: "Five of the six projects" },
  { name: "FastAPI", proof: "Five of the six projects" },
  { name: "TypeScript", proof: "RemindrAI" },
  { name: "Next.js", proof: "RemindrAI, AI Workflow Assistant, Self-Correcting Multi-Agent RAG" },
  { name: "LangGraph", proof: "AI Workflow Assistant" },
  { name: "Mastra", proof: "RemindrAI, MemorAIz Onboarding Assistant" },
  { name: "PostgreSQL", proof: "AI Workflow Assistant, Self-Correcting Multi-Agent RAG" },
];

// The brand mark drawn beside a tag: tag name to symbol id in
// src/assets/skill-icons.svg, which scripts/gen-skill-icons.mjs builds from
// this map. Only products with a published mark are listed. A practice
// (RAG, CI/CD) has none, and neither icon set carries XGBoost, Matplotlib,
// Seaborn, Power BI, SQL Server, pgvector, Twilio, llama.cpp, LiteLLM or
// Cloud Run, so those tags stay text: a borrowed or look-alike mark would
// claim a different product. Google Cloud's own mark would claim the whole platform
// for a tag that names one service of it.
// AWS, MySQL and ASP.NET Core have marks and are left out on purpose: each
// is mostly its own name in letters, which at a tag's 16px is a grey smudge
// repeating the word beside it.
// After editing, regenerate the sprite; the content tests fail if they differ.
export const skillIcons = {
  Mastra: "mastra",
  "Vercel AI SDK": "vercel",
  LangChain: "langchain",
  LangGraph: "langgraph",
  CrewAI: "crewai",
  "Hugging Face": "huggingface",
  OpenAI: "openai",
  Groq: "groq",
  PyTorch: "pytorch",
  TensorFlow: "tensorflow",
  "scikit-learn": "scikitlearn",
  OpenCV: "opencv",
  Pandas: "pandas",
  NumPy: "numpy",
  Python: "python",
  TypeScript: "typescript",
  JavaScript: "javascript",
  "C++": "cplusplus",
  React: "react",
  "Next.js": "nextdotjs",
  "Node.js": "nodedotjs",
  FastAPI: "fastapi",
  Vitest: "vitest",
  PostgreSQL: "postgresql",
  MongoDB: "mongodb",
  "Turso / libSQL": "turso",
  "Drizzle ORM": "drizzle",
  Redis: "redis",
  Kafka: "apachekafka",
  "Upstash QStash": "upstash",
  Vercel: "vercel",
  "Cloudflare Workers": "cloudflareworkers",
  Docker: "docker",
  Kubernetes: "kubernetes",
  Terraform: "terraform",
  Linux: "linux",
};
