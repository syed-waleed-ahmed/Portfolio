// icon: a key, not a component - Skills.jsx maps it to an <svg>. Keeps this
// file free of JSX so it stays pure content.
//
// A tag earns its place by being something someone could reasonably interview
// on. Editors and version control (VS Code, Jupyter, Git) and the assumed
// baseline behind a framework already listed (HTML/CSS under React) were cut
// for that reason: they pad the count without adding a claim, which makes the
// tags that do matter harder to find.
export const skillGroups = [
  {
    title: "AI / LLM Engineering",
    icon: "ai",
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
    title: "ML & Data Science",
    icon: "ml",
    tags: [
      "PyTorch",
      "TensorFlow",
      "Scikit-learn",
      "XGBoost",
      "OpenCV",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "Statistical Analysis",
    ],
  },
  {
    title: "Languages",
    icon: "code",
    tags: ["Python", "SQL", "JavaScript", "TypeScript", "C++"],
  },
  {
    title: "Web & Backend",
    icon: "web",
    tags: ["React", "Next.js", "Server Components", "Node.js", ".NET ASP Core", "REST APIs", "Serverless", "Multi-Tenancy", "Webhooks"],
  },
  {
    title: "Databases & Messaging",
    icon: "data",
    tags: ["MySQL", "PostgreSQL", "SQL Server", "MongoDB", "Turso / libSQL", "pgvector", "Drizzle ORM", "Redis", "Kafka"],
  },
  {
    title: "Cloud & DevOps",
    icon: "cloud",
    tags: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Vercel", "Upstash QStash", "Twilio", "Power BI"],
  },
];
