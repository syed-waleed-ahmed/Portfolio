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
  },
  {
    title: "TIAGo: Autonomous Mapping, Navigation & Pick-and-Place",
    role: "Robotics Project · Master's · Team of 3",
    stack: ["ROS 2 Humble", "Nav2 / SLAM", "ArUco", "Gazebo", "Python"],
    github: "https://github.com/syed-waleed-ahmed/tiago-autonomous-pick-and-place",
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
    description:
      "A platform that grades LLM outputs with an LLM judge: pairwise, pointwise, reference-based, ranking, RAG faithfulness and agent trajectories. Each pair can be judged in both orders to offset position bias, and results flag suspected prompt injection, verbosity bias and self-preference.",
    highlight:
      "Published on PyPI as one engine behind a library, CLI, REST API and Streamlit dashboard, with 98% test coverage.",
  },
  {
    title: "Visual Inspection of Motorcycle Connecting Rods",
    role: "Course Project · Master's",
    stack: ["Python", "OpenCV", "NumPy", "SciPy"],
    github:
      "https://github.com/syed-waleed-ahmed/Visual-Inspection-of-Motorcycle-Connecting-Rods",
    description:
      "A classical computer-vision pipeline that inspects connecting rods from grayscale images. It tells the two rod types apart by hole count, then measures each rod's position, orientation, length and width, and every hole's center and diameter.",
    highlight:
      "Extended to cope with distractor objects and scattered iron powder, using Gaussian and bilateral filtering and area-filtered connected components.",
  },
];
