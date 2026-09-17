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
      "Prompt Engineering",
      "Fine-tuning",
      "Mastra",
      "Vercel AI SDK",
      "LangChain",
      "LangGraph",
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
    tags: ["AWS", "Vercel", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
  },
];
