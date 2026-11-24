// Every claim on a card must be checkable against its repository (or, for
// RemindrAI, the thesis). In September 2026 three cards were re-synced against
// their READMEs: the connecting-rod card described production-line defect
// classification the course project never did, and the multi-agent and RAG
// stacks listed LangGraph and LangChain, which neither codebase uses.
//
// In November 2026 the RAG, multi-agent and LLM-as-Judge repositories each
// grew into a deployed service, and their cards were re-synced again: figures
// come from each repository's README, evaluation or build-status page, and
// the test counts and coverage were measured from a checkout of `main`. The
// LLM-as-Judge card returned, having been cut in July 2026 when that
// repository was a prototype, and the Bachelor's thesis card left to keep two
// full rows of three: it had no repository, and its "~25% control-loop
// stability" figure could not be traced to a source.
//
// Density matches across cards: two-sentence descriptions of 32-53 words,
// highlights of 9-26 words, four or five stack chips. test/data.test.js
// checks the ranges.
//
// A card carries either `github` or `sourceNote`, never both: they share the
// last row of the card grid, and a card holding neither left a band of blank
// surface its neighbour in the same row did not have. `sourceNote` states why
// there is no link and nothing more - it is not a place for a further claim
// about the work. `demo`, a running deployment, sits beside `github` in that
// row, so it needs a public repository too.
//
// Later that month the connecting-rod course project gave its place to the
// FastAPI Niche Assistant, a fine-tuned model running as a public service,
// and every card gained a picture. `image` names four files in
// src/assets/projects (<image>-480 and <image>-960, each as .avif and as the
// .webp a browser without AVIF falls back to) and `imageAlt` says what the
// picture shows. The picture row is shared across the grid like
// the others, so every card has one. Each is a crop of an image from that
// project's own repository, or for RemindrAI from the thesis poster, never a
// mock-up: docs/design.md lists each source.
//
// On 2026-11-15 the TIAGo robotics card gave its place to the AI Workflow
// Assistant, a deployed data-analysis agent, keeping the grid at two rows of
// three; TIAGo stays listed on the GitHub profile. The same pass moved the
// Niche Assistant to its Qwen2.5-Coder release, with a fresh crop of the
// web UI that shows the new model version, and the RAG test count to 347.
//
// On 2026-11-19 Campaign Forge gave its place to the Multi-Agent Research
// Team, which became a deployed web platform on 2026-11-16. Both are
// multi-agent pipelines; the Research Team's public demo runs real agents,
// where Campaign Forge's answers with a simulated responder unless given a
// key. Campaign Forge stays pinned on the GitHub profile. The same pass
// re-cut the AI Workflow Assistant's picture from the screenshot that
// repository retook when it folded reports into analyses.
//
// On 2026-11-23 the grid stopped giving every card the same weight.
// `featured` marks the one project that opens the section as a wide card,
// with its picture beside its text and its `role` shown above its title; it
// is the first entry, and a content test holds it to exactly one. The other
// five no longer print `role`, which read "Independent Project" five times
// over: the section's subtitle says it once. The field stays on every entry
// for the command palette's search.
export const projects = [
  {
    title: "RemindrAI: Embeddable Multi-Tenant Reminder Capability",
    role: "Master's Thesis · MemorAIz S.r.l.",
    featured: true,
    // Three figures under the highlight on the featured card, each restating
    // a claim the MemorAIz entry in experience.js already makes: `claim` is
    // that phrase, and a content test fails if the entry stops saying it.
    // Nothing here is a new number.
    facts: [
      { value: "985", label: "tests across three repositories", claim: "985 tests across three repositories" },
      { value: "100K", label: "due reminders, claim latency near-flat", claim: "near-flat from 1K to 100K due reminders" },
      { value: "4", label: "independent depths of tenant isolation", claim: "tenant isolation at four independent depths" },
    ],
    stack: ["Next.js 16", "TypeScript", "Vercel AI SDK", "Mastra", "Turso / libSQL"],
    // The MemorAIz entry in experience.js carries the build, delivery, tenancy
    // and deployment facts. This card says what the system does and where the
    // model's authority stops, and the highlight states the adoption result,
    // so the two sections say different things about the same work.
    description:
      "A reminder and messaging service that AI assistants embed instead of rebuilding. An agent turns plain chat into reminders delivered over Email, WhatsApp, Telegram, and Discord, and each reminder's owner is pinned outside the model, so a prompt injection cannot retarget it.",
    highlight:
      "Its first tenant adopted it with a base URL and a token, holding no scheduler, queue, or provider secret.",
    sourceNote: "Private repository · MemorAIz",
    image: "remindrai",
    imageAlt:
      "From the thesis poster: a chat message asking for a reminder, the task and time the assistant understood, and the same reminder arriving on WhatsApp, Telegram, Discord and Email.",
  },
  {
    title: "AI Workflow Assistant: Data Analyst for Spreadsheets",
    role: "Independent Project",
    stack: ["Python", "LangGraph", "FastAPI", "Next.js", "PostgreSQL"],
    github: "https://github.com/syed-waleed-ahmed/AI-Workflow-Assistant",
    // The live app asks for a free account; the bundled sample dataset is
    // one click away once signed in.
    demo: "https://ai-workflow-assistant-app.vercel.app",
    image: "ai-workflow-assistant",
    imageAlt:
      "A finished report on the bundled sales dataset in dark mode: the question asked, a banner confirming all 16 figures were verified against computed results, a summary and key revenue metrics.",
    description:
      "An AI data analyst for spreadsheets: upload a CSV or Excel file, ask a question in plain language, and get a report with metrics, charts, findings and recommendations. A LangGraph agent plans the analysis and calls deterministic pandas tools, and nothing the model writes is ever executed as code.",
    // 508 = 375 backend tests (pytest) and 133 frontend tests (Vitest,
    // Testing Library, axe), both collected from a checkout of main on
    // 2026-11-19, after the command-menu release.
    highlight:
      "Every number in a report is checked against the pandas computation behind it before you see it, backed by 508 tests.",
  },
  {
    title: "Multi-Agent Research Team: Open-Source AI Research Platform",
    role: "Independent Project",
    stack: ["Python", "CrewAI", "LiteLLM", "FastAPI", "React"],
    github: "https://github.com/syed-waleed-ahmed/Multi-Agent-Research-Team",
    // Real agents on free tiers: the first visit after 15 idle minutes takes
    // about a minute to wake the server, and each visitor gets 10 runs a day.
    demo: "https://multi-agent-research-team-aasz.onrender.com",
    image: "research-team",
    imageAlt:
      "A completed research run on rate limiting a public REST API: the research, coding and manager agents each marked completed, with their timings, web searches and model requests.",
    description:
      "A research platform where three CrewAI agents search the web, write runnable code examples and deliver a cited Markdown report, while the browser shows every search, retry and provider fallback as it happens. Every report link is checked against the URLs the search actually retrieved, and the rest are flagged.",
    // 259 = 185 backend tests (pytest), 55 frontend tests (Vitest) and 19
    // Playwright end-to-end tests, collected from a checkout of main on
    // 2026-11-19. The three Playwright specs that only take the README's
    // screenshots are not counted.
    highlight:
      "Jobs survive restarts and deploys, and per-stage provider fallbacks keep the free-tier demo running, with 259 tests across pytest, Vitest and Playwright.",
  },
  {
    title: "Self-Correcting Multi-Agent RAG",
    role: "Independent Project",
    stack: ["Python", "FastAPI", "PostgreSQL / pgvector", "Next.js", "Groq"],
    github: "https://github.com/syed-waleed-ahmed/Self-Correcting-RAG",
    demo: "https://scrag-web.onrender.com/",
    image: "self-correcting-rag",
    imageAlt:
      "The SCRAG demo's Ask tab: a question about what triggers self-correction, the answer mode and search scope, and a row of sample questions.",
    description:
      "A RAG system that checks its own work: a guardrail agent drops off-topic chunks from hybrid BM25 and vector search, and an evaluator grades each answer against its sources, correcting weak ones in a bounded loop. A tool-using agent adds read-only SQL, and visitors can search their own uploads.",
    highlight:
      "Hybrid search lifted recall@5 from 0.967 to 0.992 over dense retrieval on a 60-question golden set, backed by 347 tests.",
  },
  {
    title: "LLM-as-Judge: Evaluation Platform for LLM Outputs",
    role: "Independent Project",
    stack: ["Python", "Pydantic", "FastAPI", "Streamlit", "Groq / Ollama"],
    github: "https://github.com/syed-waleed-ahmed/LLM-as-Judge",
    demo: "https://llm-as-judge.streamlit.app/",
    image: "llm-as-judge",
    imageAlt:
      "A pairwise verdict in the LLM-as-Judge playground: output B preferred at 0.89 to 0.11, with a warning of possible verbosity bias and a bar chart of scores.",
    description:
      "A platform that grades LLM outputs with an LLM judge: pairwise, pointwise, reference-based, ranking, RAG faithfulness and agent trajectories. Each pair can be judged in both orders to offset position bias, and results flag suspected prompt injection, verbosity bias and self-preference.",
    highlight:
      "Published on PyPI as one engine behind a library, CLI, REST API and Streamlit dashboard, with 98% test coverage.",
  },
  {
    title: "FastAPI Niche Assistant: Fine-Tuned Small Language Model",
    role: "Independent Project",
    stack: ["Python", "LoRA / PEFT", "llama.cpp", "FastAPI", "Cloudflare Workers"],
    github: "https://github.com/syed-waleed-ahmed/Niche-Finetuned-Model",
    // A public demo: no key, rate-limited per IP at the edge.
    demo: "https://fastapi-assistant-edge.fastapi-assistant-edge.workers.dev/",
    image: "fastapi-assistant",
    imageAlt:
      "The assistant's web UI: a prompt to ask anything about FastAPI, the fine-tuned model's version marked ready, a note that the public demo needs no key, and four example questions.",
    // The edge sentence names only what the live deployment runs. The Worker
    // can also cache answers and fail over to a backup origin, but the README
    // lists the Redis cache as optional and the backups as not deployed. The
    // two scores are the README's: the deployed Qwen fine-tune and the
    // TinyLlama release it replaced on 2026-11-15, both in one run of the CI
    // eval gate.
    description:
      "A 1.5B-parameter Qwen2.5-Coder model fine-tuned with LoRA to answer FastAPI questions, quantized to a 1 GB GGUF and served by llama.cpp on CPU behind an OpenAI-compatible streaming API. A Cloudflare Worker rate-limits requests at the edge in front of Google Cloud Run, all on free tiers.",
    highlight:
      "An eval gate decides each release: the Qwen fine-tune scored 0.666 against 0.546 for the TinyLlama release it replaced, on a 108-item held-out set.",
  },
];
