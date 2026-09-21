// Every claim on a card must be checkable against its repository (or, for
// RemindrAI, the thesis). In September 2026 three cards were re-synced against
// their READMEs: the connecting-rod card described production-line defect
// classification the course project never did, and the multi-agent and RAG
// stacks listed LangGraph and LangChain, which neither codebase uses.
//
// Density matches across cards: two-sentence descriptions of 32-53 words,
// highlights of 9-26 words, four or five stack chips. test/data.test.js
// checks the ranges.
//
// A card carries either `github` or `sourceNote`, never both: they share the
// last row of the card grid, and a card holding neither left a band of blank
// surface its neighbour in the same row did not have. `sourceNote` states why
// there is no link and nothing more - it is not a place for a further claim
// about the work.
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
    title: "Campaign Forge: Multi-Agent Marketing Workflow",
    role: "Independent Project",
    stack: ["Python", "OpenAI SDK", "Groq", "Pydantic", "pytest"],
    github: "https://github.com/syed-waleed-ahmed/Multi-Agent-Workflow",
    description:
      "A multi-agent pipeline that turns a one-line product brief into a campaign ready to hand off. Research, copywriter, art-director and manager agents each own one stage, running on any OpenAI-compatible endpoint with Groq as the default.",
    highlight:
      "Retries with backoff, Pydantic-validated output and a self-repairing JSON step, backed by 94% test coverage and an adversarial eval corpus.",
  },
  {
    title: "Self-Correcting RAG Pipeline",
    role: "Independent Project",
    stack: ["Python", "FastAPI", "sentence-transformers", "FAISS", "Groq"],
    github: "https://github.com/syed-waleed-ahmed/Self-Correcting-RAG",
    description:
      "A RAG pipeline that checks its own work. A guardrail agent scores each retrieved chunk and drops off-topic context, then an evaluator grades the answer against its sources and triggers a bounded correction loop when grounding is weak.",
    highlight:
      "Keeps the best-scoring attempt, so a correction never regresses an answer. Served as a FastAPI service and a CLI, with 31 offline tests.",
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
  {
    title: "Delay Classification for Tele-Robotic Systems",
    role: "Bachelor's Thesis",
    stack: ["Signal Processing", "TCP/IP", "UDP", "Networking", "C++"],
    description:
      "A time-series and ML pipeline that classifies network delay across LAN, WAN, and 4G environments. Built from captured latency traces, it flags the conditions that would destabilize a remote tele-robotic control loop before they cause failures.",
    highlight:
      "~25% improvement in control-loop stability under variable network conditions.",
    sourceNote: "No public repository",
  },
];
