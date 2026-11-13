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
// and every card gained a picture. `image` names a pair of files in
// src/assets/projects (<image>-480.avif and <image>-960.avif) and `imageAlt`
// says what the picture shows. The picture row is shared across the grid like
// the others, so every card has one. Each is a crop of an image from that
// project's own repository, or for RemindrAI from the thesis poster, never a
// mock-up: docs/design.md lists each source.
export const projects = [
  {
    title: "RemindrAI: Embeddable Multi-Tenant Reminder Capability",
    role: "Master's Thesis · MemorAIz S.r.l.",
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
    title: "TIAGo: Autonomous Mapping, Navigation & Pick-and-Place",
    role: "Robotics Project · Master's · Team of 3",
    stack: ["ROS 2 Humble", "Nav2 / SLAM", "ArUco", "Gazebo", "Python"],
    github: "https://github.com/syed-waleed-ahmed/tiago-autonomous-pick-and-place",
    image: "tiago",
    imageAlt:
      "The map TIAGo built with SLAM, shown in RViz beside the simulated rooms in Gazebo that it explored, with the robot's laser scan sweeping one of them.",
    description:
      "A TIAGo mobile manipulator that maps an unknown indoor space on its own, then recovers where it is from a random start pose, finds two workstations by their ArUco markers, and carries two cubes between them in a required order. It runs end to end with no teleoperation, one launch command per task.",
    highlight:
      "No map coordinates in the source: every station and cube pose is discovered from markers at runtime, so the mission moves to a new world unchanged.",
  },
  {
    title: "Campaign Forge: Multi-Agent Marketing Platform",
    role: "Independent Project",
    stack: ["Python", "Pydantic", "FastAPI", "Streamlit", "Groq"],
    github: "https://github.com/syed-waleed-ahmed/Multi-Agent-Workflow",
    // Opens in demo mode, where a simulated responder answers and labels
    // every output as such; live mode needs a Groq key.
    demo: "https://campaign-forge.streamlit.app/",
    image: "campaign-forge",
    imageAlt:
      "Campaign Forge's Run Inspector on a completed full-campaign run in demo mode: 14 model calls, 6128 tokens, 11 of 11 steps, above a graph of the agents that ran.",
    description:
      "A multi-agent workflow engine that turns a product brief into reviewed, evidence-backed marketing work, from full campaigns to landing pages and SEO packs. Its 28 agents run on free-tier providers, checkpoint every step, pause at a quota and resume, and cite research checked against what was retrieved.",
    highlight:
      "An Evaluation Lab scores workflows on deterministic checks, including 14 prompt-injection attacks, and the test suite holds 97% branch coverage.",
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
      "Hybrid search lifted recall@5 from 0.967 to 0.992 over dense retrieval on a 60-question golden set, backed by 341 tests.",
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
      "The assistant's web UI: a prompt to ask anything about FastAPI, the fine-tuned model's version marked ready, and six example questions.",
    // The edge sentence names only what the live deployment runs. The Worker
    // can also cache answers and fail over to a backup origin, but the README
    // lists the Redis cache as optional and the backups as not deployed. The
    // two scores are the README's: both models in one run of the CI eval gate.
    description:
      "A 1.1B-parameter language model fine-tuned with LoRA to answer FastAPI questions, quantized to a 0.7 GB GGUF and served by llama.cpp on CPU behind an OpenAI-compatible streaming API. A Cloudflare Worker rate-limits requests at the edge in front of Google Cloud Run, all on free tiers.",
    highlight:
      "An eval gate decides each release: the fine-tune scored 0.546 against the base model's 0.402 on a 108-item held-out set, run on the production backend.",
  },
];
