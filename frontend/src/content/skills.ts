// Two tiers, so the list says how well each skill is evidenced. "Shown" means
// a project or role on this site uses it in something that runs; each group
// names where. "Familiar" means coursework or trainee-level use with nothing
// on the site to inspect. Tools the CVs no longer list are not here.

export interface SkillGroup {
  name: string;
  skills: string[];
  // Where the work on this site shows the group, by project slug or role.
  shownIn: string;
}

export const shownSkills: SkillGroup[] = [
  {
    name: "Languages",
    skills: ["Python", "TypeScript", "SQL"],
    shownIn: "Every project; RemindrAI is TypeScript and SQL, the other five are Python first",
  },
  {
    name: "LLM systems",
    skills: [
      "Tool calling and agents",
      "Retrieval (hybrid BM25 and vector)",
      "LLM evaluation and LLM-as-judge",
      "Structured outputs",
      "Prompt-injection-aware design",
      "LoRA fine-tuning and GGUF quantization",
    ],
    shownIn: "RemindrAI, Self-Correcting RAG, LLM-as-Judge, FastAPI Niche Assistant",
  },
  {
    name: "Frameworks",
    skills: ["Vercel AI SDK", "Mastra", "LangGraph", "CrewAI", "PyTorch, Transformers and PEFT", "llama.cpp", "FastAPI", "Next.js", "React", "Node.js"],
    shownIn: "Named in each case study's stack; PyTorch through the fine-tune's training",
  },
  {
    name: "Data",
    skills: ["PostgreSQL", "pgvector", "Turso / libSQL", "pandas", "scikit-learn", "XGBoost"],
    shownIn: "RemindrAI, Self-Correcting RAG, AI Workflow Assistant, Fruugle",
  },
  {
    name: "Delivery",
    skills: ["Docker", "GitHub Actions", "pytest", "Vitest", "Playwright", "Vercel", "Google Cloud Run", "Cloudflare Workers", "Render"],
    shownIn: "Every project is deployed and tested in CI; this site runs on Cloudflare Workers",
  },
];

export const familiarSkills: string[] = [
  "C# and ASP.NET Core (trainee)",
  "PHP and MySQL (trainee)",
  "SQL Server, SSRS and Power BI (trainee)",
  "NumPy and OpenCV (coursework)",
  "ROS 2, Gazebo and Nav2 (coursework)",
];
