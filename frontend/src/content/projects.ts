// The six projects, in page order. Each has a case study at /work/<slug>/
// (src/case-studies/<slug>.tsx); this file holds what the home page and the
// structured data need.
//
// Rules, held by test/content.test.ts:
// - `evidence` is the measured result with its caveat in the same sentence.
//   It never states a figure the project's own repository or report does not.
// - Test counts are not results. They may appear in a case study's
//   reliability section, never as a project's headline.
// - A project has a public repository or says why it does not.

export type ProjectSource =
  | { kind: "public"; repository: string }
  | { kind: "private"; note: string };

export interface Project {
  slug: string;
  title: string;
  // What it is, in a phrase.
  subtitle: string;
  context: "Master's thesis, MemorAIz S.r.l." | "Independent project";
  period: string;
  // Two sentences at most: the problem and the approach.
  summary: string;
  // The core flow, in order, as short steps. Rendered as a pipeline strip.
  pipeline: string[];
  // The one engineering decision worth asking about in an interview.
  decision: string;
  // The measured result, with its caveat.
  evidence: string;
  stack: string[];
  // For the structured data.
  languages: string[];
  source: ProjectSource;
  demo?: string;
}

export const projects: Project[] = [
  {
    slug: "remindrai",
    title: "RemindrAI",
    subtitle: "an embeddable, multi-tenant reminder and messaging capability",
    context: "Master's thesis, MemorAIz S.r.l.",
    period: "Feb - Sep 2026",
    summary:
      "Conversational apps embed RemindrAI instead of building their own scheduler. An agent turns a chat message into a reminder, and a delivery loop sends it by Email, WhatsApp, Telegram or Discord, retrying failures without ever sending it twice to the same channel.",
    pipeline: ["Chat message", "Agent tool call", "Tenant API", "Reminder row", "Atomic claim when due", "Channel adapter", "Email, WhatsApp, Telegram, Discord"],
    decision:
      "Identity never travels in an argument the model controls: the tenant comes from the API key and the user from the host app's session, so a prompt injection cannot reach another user's reminders.",
    evidence:
      "A 92-case evaluation of the agent caught real regressions, among them a prompt edit that dropped one model from 17 to 12 of 18 scheduling cases. In a local benchmark the median claim of 100 due reminders took 7.5 ms at 1K pending and 11.1 ms at 100K.",
    stack: ["TypeScript", "Next.js", "Vercel AI SDK", "Mastra", "Turso / libSQL", "Upstash QStash"],
    languages: ["TypeScript"],
    source: { kind: "private", note: "Private repository, property of MemorAIz S.r.l." },
  },
  {
    slug: "self-correcting-rag",
    title: "Self-Correcting RAG",
    subtitle: "hybrid retrieval with a relevance filter and a grounding check",
    context: "Independent project",
    period: "Nov 2025 - Nov 2026",
    summary:
      "A question-answering service that combines BM25 and vector search, drops off-topic passages with an LLM filter, and grades each answer against its sources before returning it, allowing one correction when the grade is low.",
    pipeline: ["Question", "BM25 + vector search", "Rank fusion", "Relevance filter", "Answer", "Grounding check", "One correction"],
    decision:
      "Embeddings run on ONNX instead of torch: half the image size (211 against 428 MB) and a quarter of the query time (3.0 against 12.3 ms) with identical vectors, which is what fits a free-tier container.",
    evidence:
      "Hybrid search lifted recall@5 from 0.967 to 0.992 on 60 author-written questions, but that is two questions, and a paired bootstrap interval for the gain (0.000 to 0.067) does not exclude zero. On the answers it judged, self-correction changed no outcome and cost about 2.6 times the tokens.",
    stack: ["Python", "FastAPI", "PostgreSQL / pgvector", "Next.js", "Prometheus"],
    languages: ["Python", "TypeScript"],
    source: { kind: "public", repository: "https://github.com/syed-waleed-ahmed/Self-Correcting-RAG" },
    demo: "https://scrag-web.onrender.com/",
  },
  {
    slug: "llm-as-judge",
    title: "LLM-as-Judge",
    subtitle: "an evaluation library for LLM outputs",
    context: "Independent project",
    period: "Nov 2025 - Nov 2026",
    summary:
      "A Python library, CLI, REST API and dashboard that grade LLM outputs with an LLM judge: pairwise, pointwise, reference-based, ranking, RAG faithfulness and agent trajectories.",
    pipeline: ["Outputs to compare", "Judge prompt, both orders", "Parsed scores", "Bias heuristics", "Report, API or dashboard"],
    decision:
      "A pair can be judged in both orders, in parallel, and a winner that changes with the order is flagged, because LLM judges favour whichever answer they read first. The numbers in a verdict always override the judge's prose.",
    evidence:
      "Published on PyPI with 98% line coverage of the library in CI. It has not been validated against human labels, its bundled benchmarks are 49 synthetic rows, and its bias flags are heuristics such as a 2x length ratio.",
    stack: ["Python", "Pydantic", "FastAPI", "Streamlit", "Groq / Ollama"],
    languages: ["Python"],
    source: { kind: "public", repository: "https://github.com/syed-waleed-ahmed/LLM-as-Judge" },
    demo: "https://llm-as-judge.streamlit.app/",
  },
  {
    slug: "fastapi-niche-assistant",
    title: "FastAPI Niche Assistant",
    subtitle: "a fine-tuned small model served on CPU",
    context: "Independent project",
    period: "Nov 2025 - Nov 2026",
    summary:
      "Qwen2.5-Coder-1.5B fine-tuned with LoRA to answer FastAPI questions, quantized to a 1 GB GGUF and served by llama.cpp on CPU behind an OpenAI-compatible streaming API, with a Cloudflare Worker in front.",
    pipeline: ["Q&A pairs", "LoRA fine-tune", "Merge", "GGUF quantization", "llama.cpp on Cloud Run", "Worker at the edge"],
    decision:
      "Two evaluation gates decide a release: a fine-tune must beat its own base model, and a new release may fall at most 0.02 below the deployed one, re-scored on the same machine.",
    evidence:
      "On 108 held-out items the fine-tune beat its untuned base model by 0.114 (95% CI 0.069 to 0.160, paired bootstrap; better on 84 items), on a composite of keyword recall, code that parses and ROUGE-L. Training and evaluation data came from the same partly model-drafted process, and no human has graded the answers.",
    stack: ["Python", "LoRA / PEFT", "llama.cpp", "FastAPI", "Cloudflare Workers"],
    languages: ["Python", "TypeScript"],
    source: { kind: "public", repository: "https://github.com/syed-waleed-ahmed/Niche-Finetuned-Model" },
    demo: "https://fastapi-assistant-edge.fastapi-assistant-edge.workers.dev/",
  },
  {
    slug: "ai-workflow-assistant",
    title: "AI Workflow Assistant",
    subtitle: "a data analyst for spreadsheets",
    context: "Independent project",
    period: "Nov 2025 - Nov 2026",
    summary:
      "Upload a CSV or Excel file, ask a question in plain language, and get a report with metrics, charts and findings. A LangGraph agent plans the analysis and calls deterministic pandas tools; nothing the model writes is executed as code.",
    pipeline: ["Spreadsheet", "Profile", "Agent plans", "pandas tools", "Draft report", "Number check", "Report"],
    decision:
      "The model never writes code that runs. It chooses among fixed, tested pandas tools, and every number in the report's findings is checked against the values those tools computed.",
    evidence:
      "A figure that matches no computed value triggers one regeneration, then is flagged in the report. The check covers numbers, not wording, and its accuracy has not yet been measured on a test set.",
    stack: ["Python", "LangGraph", "FastAPI", "Next.js", "PostgreSQL"],
    languages: ["Python", "TypeScript"],
    source: { kind: "public", repository: "https://github.com/syed-waleed-ahmed/AI-Workflow-Assistant" },
    demo: "https://ai-workflow-assistant-app.vercel.app",
  },
  {
    slug: "multi-agent-research-team",
    title: "Multi-Agent Research Team",
    subtitle: "a three-stage research pipeline with live progress",
    context: "Independent project",
    period: "Nov 2025 - Nov 2026",
    summary:
      "Three CrewAI agents research a topic on the web, write code examples and assemble a cited Markdown report, while the browser streams every search, retry and provider fallback as it happens.",
    pipeline: ["Topic", "Research agent", "Coding agent", "Manager agent", "Link check", "Cited report"],
    decision:
      "A fixed three-stage pipeline instead of agents delegating to each other: web search is the only tool, so cost and behaviour stay bounded, and each stage can re-run on a fallback model when a provider rate-limits.",
    evidence:
      "Report quality has not been measured. Links are checked against the URLs the search returned, code examples are parsed but never run, and a job interrupted mid-run is marked failed rather than resumed.",
    stack: ["Python", "CrewAI", "LiteLLM", "FastAPI", "React"],
    languages: ["Python", "TypeScript"],
    source: { kind: "public", repository: "https://github.com/syed-waleed-ahmed/Multi-Agent-Research-Team" },
    demo: "https://multi-agent-research-team-aasz.onrender.com",
  },
];

export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);
